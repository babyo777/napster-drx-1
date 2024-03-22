import { IoShareOutline } from "react-icons/io5";
import { Drawer, DrawerContent, DrawerTrigger } from "../ui/drawer";
import { AspectRatio } from "../ui/aspect-ratio";
import { Blurhash } from "react-blurhash";
import { toBlob } from "html-to-image";
import { useCallback, useState } from "react";
import { encode } from "blurhash";
import { useSelector } from "react-redux";
import { RootState } from "@/Store/Store";
import { TbMicrophone2 } from "react-icons/tb";
import { LiaExchangeAltSolid } from "react-icons/lia";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import { GetImage } from "@/API/api";
import Loader from "../Loaders/Loader";

function ShareLyrics({
  lyrics,
}: {
  lyrics?: [
    {
      time: number | string;
      lyrics: string;
    }
  ];
}) {
  const currentIndex = useSelector(
    (state: RootState) => state.musicReducer.currentIndex
  );
  const playlist = useSelector(
    (state: RootState) => state.musicReducer.playlist
  );

  const loadImage = useCallback(async (src: string) => {
    return new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => resolve(img);
      img.onerror = (error) => reject(error);
      img.src = src;
    });
  }, []);

  const getImageData = useCallback((image: HTMLImageElement) => {
    const canvas = document.createElement("canvas");
    canvas.width = image.width;
    canvas.height = image.height;
    const context = canvas.getContext("2d");
    if (context) {
      context.drawImage(image, 0, 0);
      return context.getImageData(0, 0, image.width, image.height);
    }
  }, []);

  const [blurHash, setBlurHash] = useState<string>(
    "L56bv5}iVBV|-LrnN$WB0rIT$_pK"
  );

  const [round, setRound] = useState<boolean>(true);
  const shareLyrics = useCallback(async () => {
    setRound(false);

    const lyrics = document.getElementById("lyrics");
    if (lyrics == null) return;

    try {
      await toBlob(lyrics, {
        cacheBust: true,
      });
      toBlob(lyrics, {
        cacheBust: true,
      }).then(async (blob) => {
        if (!blob) return;
        setRound(true);

        const file = new File([blob], "share.png", { type: "image/png" });

        const shareFile = [file];

        await navigator.share({
          files: shareFile,
        });
      });
    } catch (error) {
      setRound(true);
      console.error(error);
    }
  }, []);

  const [count, setCount] = useState<number>(0);
  const handleCount = useCallback(() => {
    if (lyrics) {
      setCount((prev) => (prev + 1) % lyrics.length);
    }
  }, [lyrics]);

  const [blur, setBlur] = useState<boolean>(false);
  const [ShareSong, setShareSong] = useState<boolean>(true);

  const encodeImageToBlurhash = useCallback(
    async (imageUrl: string) => {
      setRound(false);
      const image = await loadImage(imageUrl);
      const imageData = getImageData(image as unknown as HTMLImageElement);
      if (imageData) {
        setBlur((prev) => !prev);
        setRound(true);
        return setBlurHash(
          encode(imageData.data, imageData.width, imageData.height, 4, 4)
        );
      }
    },
    [getImageData, loadImage]
  );

  const handleShareSong = useCallback(() => {
    setShareSong((prev) => !prev);
  }, []);

  return (
    <Drawer>
      <DrawerTrigger className="m-0 p-1.5 flex  justify-center items-center bg-zinc-900 rounded-full">
        <IoShareOutline className="h-6 w-6 text-white" />
      </DrawerTrigger>
      <DrawerContent className="  h-[100dvh] rounded-none px-[4.5vw]  bg-[#09090b]">
        {!round && (
          <div className=" absolute z-10 bg-black/50 w-[91vw] h-[100dvh] flex justify-center items-center">
            <Loader color="white" />
          </div>
        )}
        <div className=" relative flex pt-[5vh] flex-col space-y-3 justify-center items-center py-[1vh] ">
          <AspectRatio
            id="lyrics"
            ratio={9 / 16}
            className={`relative shadow-none flex items-center justify-center overflow-hidden ${
              round ? "rounded-2xl" : ""
            }`}
          >
            {blur ? (
              <Blurhash
                hash={blurHash}
                width={"100%"}
                height={"100%"}
                resolutionX={32}
                resolutionY={32}
                punch={1}
              />
            ) : (
              <LazyLoadImage
                loading="lazy"
                src={
                  playlist[currentIndex].thumbnailUrl.replace(
                    "w120-h120",
                    "w1080-h1080"
                  ) || "./favicon.jpeg"
                }
                width="100%"
                effect="blur"
                visibleByDefault
                height="100%"
                alt="Image"
                className="rounded-md blur-[1.5px] object-cover h-[100%] w-[100%]"
              />
            )}
            <div className=" absolute text-zinc-100  overflow-hidden rounded-2xl font-semibold backdrop-blur-lg">
              {ShareSong ? (
                <div className=" flex flex-col text-left  space-y-2  bg-black/30  py-3 px-3 pt-4">
                  <div className="overflow-hidden flex h-[15.5rem] w-[15.5rem]">
                    <LazyLoadImage
                      src={
                        playlist[currentIndex].thumbnailUrl.replace(
                          "w120-h120",
                          "w1080-h1080"
                        ) || "/favicon.jpeg"
                      }
                      width="100%"
                      effect="blur"
                      height="100%"
                      alt="Image"
                      loading="lazy"
                      visibleByDefault
                      className="rounded-xl object-cover h-[100%] w-[100%]"
                    />
                  </div>
                  <div className=" break-words ">
                    <p className="text-lg  leading-[1.5rem] font-bold mt-0.5 break-words max-w-[59vw]">
                      {playlist[currentIndex]?.title}
                    </p>
                    <p className=" -mt-0.5 text-zinc-200 text-base font-semibold break-words max-w-[55vw]">
                      {playlist[currentIndex]?.artists[0]?.name}
                    </p>
                    <p className=" text-sm mt-0.5 text-zinc-300/50 font-semibold break-words max-w-[55vw]">
                      Napster
                    </p>
                  </div>
                </div>
              ) : (
                <div
                  onClick={handleCount}
                  className="flex flex-col justify-center"
                >
                  {lyrics && lyrics[count].lyrics.length > 0 && (
                    <div className="break-words bg-black/25 text-2xl px-4 py-2 min-w-[77vw]  max-w-[77vw] text-left">
                      <p>{lyrics[count].lyrics}</p>
                    </div>
                  )}
                  <div className=" flex  space-x-2 items-center bg-black/30 py-3 px-3">
                    <div className="overflow-hidden flex h-[3.3rem] w-[3.3rem]">
                      <AspectRatio ratio={1 / 1}>
                        <LazyLoadImage
                          src={
                            playlist[currentIndex].thumbnailUrl.replace(
                              "w120-h120",
                              "w1080-h1080"
                            ) || "/favicon.jpeg"
                          }
                          width="100%"
                          effect="blur"
                          height="100%"
                          alt="Image"
                          visibleByDefault
                          loading="lazy"
                          className="rounded-lg object-cover h-[100%] w-[100%]"
                        />
                      </AspectRatio>
                    </div>
                    <div className=" font-normal   break-words max-w-[55vw]">
                      <p className="text-xl font-semibold  break-words truncate  max-w-[55vw]">
                        {playlist[currentIndex]?.title}
                      </p>
                      <p className="-mt-0.5 text-sm break-words max-w-[55vw]">
                        {playlist[currentIndex]?.artists[0]?.name}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </AspectRatio>
        </div>
        <div className=" flex justify-center items-center pt-[1vh]">
          <div className="flex space-x-[3vw] text-xs">
            <div
              onClick={shareLyrics}
              id="share"
              className="  flex items-center px-4 py-2 bg-zinc-900 text-zinc-300 rounded-xl space-x-1.5"
            >
              <IoShareOutline className=" h-6 w-6" />
              <p>Share</p>
            </div>
            <div
              onClick={() =>
                encodeImageToBlurhash(
                  `${GetImage}${playlist[currentIndex].thumbnailUrl.replace(
                    "w120-h120",
                    "w1080-h1080"
                  )}`
                )
              }
              className=" flex items-center px-2.5 py-2 bg-zinc-900 text-zinc-300 rounded-xl space-x-1.5"
            >
              <LiaExchangeAltSolid className=" h-6 w-6" />
              <p>Change BG</p>
            </div>
            {lyrics && (
              <div
                onClick={handleShareSong}
                className=" fade-in flex items-center px-2.5 py-2 bg-zinc-900 text-zinc-300 rounded-xl space-x-1.5"
              >
                <TbMicrophone2 className=" h-6 w-6" />
                <p>Show {ShareSong ? "Lyrics" : "Music"}</p>
              </div>
            )}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export default ShareLyrics;
