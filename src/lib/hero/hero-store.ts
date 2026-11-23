import fs from 'fs';
import path from 'path';
import { HeroSettings, DEFAULT_HERO_SETTINGS } from './types';

export type { HeroSettings };
export { DEFAULT_HERO_SETTINGS };

function getSettingsFilePath(): string {
  return path.join(process.cwd(), 'src', 'data', 'hero-settings.json');
}

export async function getHeroSettings(): Promise<HeroSettings> {
  try {
    const filePath = getSettingsFilePath();
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      const parsed = JSON.parse(data);
      return { ...DEFAULT_HERO_SETTINGS, ...parsed };
    }
  } catch (err) {
    console.warn('Could not read hero-settings.json, falling back to defaults:', err);
  }

  return { ...DEFAULT_HERO_SETTINGS };
}

export async function updateHeroSettings(updates: Partial<HeroSettings>): Promise<HeroSettings> {
  const current = await getHeroSettings();
  const updated: HeroSettings = {
    ...current,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  try {
    const filePath = getSettingsFilePath();
    const dirPath = path.dirname(filePath);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(updated, null, 2), 'utf-8');
  } catch (err) {
    console.warn('Failed to write hero-settings.json:', err);
  }

  return updated;
}
