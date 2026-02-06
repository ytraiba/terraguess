export interface PanoramaLocation {
  lat: number;
  lng: number;
  imageId: string;
  provider: string;
}

export interface ImageryProvider {
  readonly name: string;
  getRandomLocations(count: number): Promise<PanoramaLocation[]>;
  validateImageId(imageId: string): Promise<boolean>;
}

export interface PanoramaViewerProps {
  imageId: string;
  provider: string;
  allowMovement: boolean;
  className?: string;
}
