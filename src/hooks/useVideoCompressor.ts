import { useState, useRef, useCallback } from "react";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const COMPRESSED_BITRATE = "1M"; // 1 Mbps

interface UseVideoCompressorResult {
  compress: (file: File) => Promise<File>;
  isCompressing: boolean;
  progress: number;
  status: string;
  error: string | null;
}

export function useVideoCompressor(): UseVideoCompressorResult {
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");
  const [error, setError] = useState<string | null>(null);
  const ffmpegRef = useRef<FFmpeg | null>(null);

  const loadFFmpeg = useCallback(async (): Promise<FFmpeg> => {
    if (ffmpegRef.current) return ffmpegRef.current;

    const ffmpeg = new FFmpeg();
    
    ffmpeg.on("progress", ({ progress }) => {
      setProgress(Math.round(progress * 100));
      setStatus(`Comprimindo... ${Math.round(progress * 100)}%`);
    });

    ffmpeg.on("log", ({ message }) => {
      console.log("[FFmpeg]", message);
    });

    setStatus("Carregando compressor...");

    // Carregar FFmpeg do CDN
    const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/esm";
    
    await ffmpeg.load({
      coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
      wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
    });

    ffmpegRef.current = ffmpeg;
    return ffmpeg;
  }, []);

  const compress = useCallback(async (file: File): Promise<File> => {
    // Se o arquivo já é menor que 50MB, retorna sem compressão
    if (file.size <= MAX_FILE_SIZE) {
      console.log(`Arquivo já está abaixo do limite: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
      return file;
    }

    setIsCompressing(true);
    setProgress(0);
    setError(null);
    setStatus("Iniciando compressão...");

    try {
      const ffmpeg = await loadFFmpeg();

      setStatus("Preparando vídeo...");
      
      // Escrever arquivo de entrada
      const inputName = "input" + getFileExtension(file.name);
      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setStatus("Comprimindo vídeo...");
      setProgress(0);

      const outputName = "output.mp4";

      // Comprimir com H.264
      await ffmpeg.exec([
        "-i", inputName,
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "28",
        "-b:v", COMPRESSED_BITRATE,
        "-maxrate", COMPRESSED_BITRATE,
        "-bufsize", "2M",
        "-vf", "scale=-2:720",
        "-c:a", "aac",
        "-b:a", "128k",
        "-movflags", "+faststart",
        outputName
      ]);

      setStatus("Finalizando...");

      // Ler arquivo de saída
      const data = await ffmpeg.readFile(outputName);
      
      // Criar blob diretamente do Uint8Array
      const compressedFile = uint8ArrayToFile(
        data,
        file.name.replace(/\.[^/.]+$/, "") + "_compressed.mp4",
        "video/mp4"
      );

      // Limpar arquivos temporários
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      console.log(`Compressão concluída: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);

      // Se ainda está acima do limite, comprimir mais
      if (compressedFile.size > MAX_FILE_SIZE) {
        setStatus("Compressão adicional necessária...");
        return await compressMore(compressedFile, ffmpeg);
      }

      setIsCompressing(false);
      setStatus("Compressão concluída!");
      setProgress(100);

      return compressedFile;
    } catch (err: unknown) {
      console.error("Erro na compressão:", err);
      const errorMessage = err instanceof Error ? err.message : "Erro ao comprimir vídeo";
      setError(errorMessage);
      setIsCompressing(false);
      throw err;
    }
  }, [loadFFmpeg]);

  const compressMore = async (file: File, ffmpeg: FFmpeg): Promise<File> => {
    const inputName = "input2.mp4";
    const outputName = "output2.mp4";

    await ffmpeg.writeFile(inputName, await fetchFile(file));

    // Compressão mais agressiva
    await ffmpeg.exec([
      "-i", inputName,
      "-c:v", "libx264",
      "-preset", "slow",
      "-crf", "32",
      "-b:v", "500k",
      "-maxrate", "500k",
      "-bufsize", "1M",
      "-vf", "scale=-2:480",
      "-c:a", "aac",
      "-b:a", "96k",
      "-movflags", "+faststart",
      outputName
    ]);

    const data = await ffmpeg.readFile(outputName);
    const compressedFile = uint8ArrayToFile(
      data,
      file.name.replace(/\.[^/.]+$/, "") + "_compressed.mp4",
      "video/mp4"
    );

    await ffmpeg.deleteFile(inputName);
    await ffmpeg.deleteFile(outputName);

    return compressedFile;
  };

  return {
    compress,
    isCompressing,
    progress,
    status,
    error,
  };
}

// Função auxiliar para converter Uint8Array para File
function uint8ArrayToFile(data: unknown, filename: string, mimeType: string): File {
  let arrayBuffer: ArrayBuffer;
  
  if (data instanceof Uint8Array) {
    // Criar uma cópia do buffer como ArrayBuffer regular
    arrayBuffer = new ArrayBuffer(data.length);
    new Uint8Array(arrayBuffer).set(data);
  } else if (typeof data === "string") {
    // Se for string, converter para bytes
    const encoder = new TextEncoder();
    arrayBuffer = encoder.encode(data).buffer;
  } else {
    throw new Error("Tipo de dados não suportado");
  }
  
  return new File([arrayBuffer], filename, { type: mimeType });
}

function getFileExtension(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  if (ext && ["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) {
    return "." + ext;
  }
  return ".mp4";
}
