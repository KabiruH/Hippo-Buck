import Image from 'next/image';

interface RoomGalleryProps {
  images: string[];
  roomName: string;
}

export default function RoomGallery({ images, roomName }: RoomGalleryProps) {
  return (
    <div className="space-y-3 md:space-y-4">
      {/* Main Image */}
      <div className="relative h-64 md:h-80 lg:h-96 rounded-lg overflow-hidden">
        <Image
          src={images[0]}
          alt={`${roomName} - Main View`}
          fill
          className="object-cover"
        />
      </div>

      {/* Thumbnail Grid - 2x2 on Mobile, 4 in a row on Desktop */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
        {images.slice(1, 5).map((image, imgIndex) => (
          <div
            key={imgIndex}
            className="relative h-20 md:h-24 rounded overflow-hidden group cursor-pointer"
          >
            <Image
              src={image}
              alt={`${roomName} - View ${imgIndex + 2}`}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-300"
            />
          </div>
        ))}
      </div>
    </div>
  );
}