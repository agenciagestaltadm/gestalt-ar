export interface ArExperience {
  id: string;
  title: string;
  targetImageName: string;
  videoName: string;
  mindFileName: string;
  targetImageUrl: string;
  videoUrl: string;
  mindFileUrl: string;
  createdAt: string;
}

const STORAGE_KEY = "gestalt_ar_experiences";

export function getExperiences(): ArExperience[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveExperience(exp: ArExperience) {
  const list = getExperiences();
  list.unshift(exp);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function getExperienceById(id: string): ArExperience | undefined {
  return getExperiences().find((e) => e.id === id);
}

export function deleteExperience(id: string) {
  const list = getExperiences().filter((e) => e.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 8);
}
