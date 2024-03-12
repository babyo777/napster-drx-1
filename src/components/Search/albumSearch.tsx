import { AspectRatio } from "../ui/aspect-ratio";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { GrNext } from "react-icons/gr";
import { Link } from "react-router-dom";
import { searchAlbumsInterface } from "@/Interface";
import { useCallback } from "react";
import { DATABASE_ID, ID, INSIGHTS, db } from "@/appwrite/appwriteConfig";

function AlbumSearchComp({
  albumId,
  title,
  thumbnailUrl,
  fromSearch,
}: searchAlbumsInterface) {
  const handleClick = useCallback(() => {
    if (!fromSearch) {
      try {
        db.createDocument(DATABASE_ID, INSIGHTS, ID.unique(), {
          youtubeId: albumId,
          title: title,
          thumbnailUrl: thumbnailUrl,
          type: "album",
          for: localStorage.getItem("uid") || "error",
        });
      } catch (error) {
        console.log(error);
      }
    }
  }, [albumId, title, thumbnailUrl, fromSearch]);
  return (
    <div
      onClick={handleClick}
      className="flex fade-in py-2 space-x-2 items-center"
    >
      <Link to={`/album/${albumId}`}>
        <div className="overflow-hidden h-12 w-12 space-y-2">
          <AspectRatio ratio={1 / 1}>
            <LazyLoadImage
              src={thumbnailUrl}
              width="100%"
              height="100%"
              effect="blur"
              alt="Image"
              loading="lazy"
              onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) =>
                (e.currentTarget.src = "/demo3.jpeg")
              }
              className="rounded-sm object-cover h-[100%] w-[100%]"
            />
          </AspectRatio>
        </div>
      </Link>
      <Link to={`/album/${albumId}`}>
        <div className="flex  flex-col pl-1 text-start w-[70dvw]">
          <p className={`w-[60dvw] truncate`}>{title}</p>

          <p className="-mt-0.5  text-zinc-400 text-xs w-[40dvw]   truncate">
            Album
          </p>
        </div>
      </Link>
      <Link to={`/album/${albumId}`}>
        <GrNext />
      </Link>
    </div>
  );
}

export { AlbumSearchComp };
