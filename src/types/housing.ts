export type Coordinates = {
  latitude: number;
  longitude: number;
};

export type HousingAnnouncement = Coordinates & {
  id: string;
  title: string;
  address: string;
  sido: string;
  city: string;
  district?: string;
  type: string;
  deadline: string;
  dday: string;
  source: '청약홈' | 'LH';
};

export type RadiusOption = 5 | 10 | 20 | 30 | 50;
