import { FaPlay } from "react-icons/fa6";
import { IoReload } from "react-icons/io5";
import { useParams } from "react-router-dom";
import { useQuery } from "react-query";
import axios from "axios";
import { AlbumSongs, savedPlaylist } from "@/Interface";

import { GetAlbumSongs, SearchAlbum } from "@/API/api";
import { useDispatch, useSelector } from "react-redux";
import {
  SetPlaylistOrAlbum,
  isLoop,
  play,
  setCurrentArtistId,
  setCurrentIndex,
  setIsLikedSong,
  setPlayingPlaylistUrl,
  setPlaylist,
  shuffle,
} from "@/Store/Player";
import React, { useCallback, useEffect, useMemo } from "react";
import { RootState } from "@/Store/Store";
import Loader from "@/components/Loaders/Loader";
import { Button } from "@/components/ui/button";
import Songs from "@/components/Library/Songs";
import GoBack from "@/components/Goback";
import AddAlbum from "./AddAlbum";
import {
  ALBUM_COLLECTION_ID,
  DATABASE_ID,
  db,
} from "@/appwrite/appwriteConfig";
import { Query } from "appwrite";
import { RxShuffle } from "react-icons/rx";
import { RiFocus3Line } from "react-icons/ri";

function AlbumPageComp() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const artistId = useMemo(() => new URLSearchParams(location.search), []);

  const currentIndex = useSelector(
    (state: RootState) => state.musicReducer.currentIndex
  );
  const playingPlaylistUrl = useSelector(
    (state: RootState) => state.musicReducer.playingPlaylistUrl
  );

  const playlist = useSelector(
    (state: RootState) => state.musicReducer.playlist
  );

  const loadSavedPlaylist = async () => {
    const r = await db.listDocuments(DATABASE_ID, ALBUM_COLLECTION_ID, [
      Query.equal("for", [localStorage.getItem("uid") || "default", "default"]),
      Query.equal("link", [id || "none"]),
    ]);
    const p = r.documents as unknown as savedPlaylist[];
    return p;
  };
  const { data: isSaved } = useQuery<savedPlaylist[]>(
    ["checkIfSaved", id],
    loadSavedPlaylist,
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  const getPlaylist = async () => {
    const list = await axios.get(`${GetAlbumSongs}${id}`);
    return list.data as AlbumSongs[];
  };

  const isPlaying = useSelector(
    (state: RootState) => state.musicReducer.isPlaying
  );
  const { data, isLoading, isError, refetch, isRefetching } = useQuery<
    AlbumSongs[]
  >(["album", id], getPlaylist, {
    retry: 5,
    refetchOnWindowFocus: false,
    staleTime: 60 * 600000,
  });

  const artistSearch = async () => {
    const q = await axios.get(
      `${SearchAlbum}${(data && data[0].album) || ""} ${
        (data && data[0].artists[0].name) || ""
      }`
    );
    dispatch(setCurrentArtistId(q.data[0].artistId));
    return q.data[0].artistId as string;
  };

  const { refetch: a } = useQuery<string>(["searchAlbumArtist"], artistSearch, {
    enabled: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    dispatch(setIsLikedSong(false));
  }, [dispatch]);
  const handleArtist = useCallback(async () => {
    a();
  }, [a]);
  const handleShufflePlay = useCallback(() => {
    if (data) {
      handleArtist();
      dispatch(shuffle(data));
      dispatch(setCurrentIndex(0));

      dispatch(setPlayingPlaylistUrl(id || ""));
      dispatch(SetPlaylistOrAlbum("album"));
      if (data.length == 1) {
        dispatch(isLoop(true));
      } else {
        dispatch(isLoop(false));
      }
      if (!isPlaying) {
        dispatch(play(true));
      }
    }
  }, [dispatch, data, isPlaying, id, handleArtist]);
  const handlePlay = useCallback(() => {
    if (data) {
      handleArtist();
      dispatch(setPlaylist(data));
      dispatch(
        setCurrentArtistId(data[0].artists[0].id || artistId.get("id") || "")
      );

      dispatch(setCurrentIndex(0));
      dispatch(SetPlaylistOrAlbum("album"));
      dispatch(setPlayingPlaylistUrl(id || ""));
      if (data.length === 1) dispatch(isLoop(true));
      if (!isPlaying) {
        dispatch(play(true));
      }
    }
  }, [dispatch, data, isPlaying, id, artistId, handleArtist]);

  const handleFocus = useCallback(() => {
    const toFocus = document.getElementById(playlist[currentIndex].youtubeId);
    toFocus?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [currentIndex, playlist]);

  return (
    <div className=" flex flex-col items-center">
      {isError && (
        <div className=" relative  w-full">
          <div className="fixed  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            No album found
          </div>
          <GoBack />
        </div>
      )}
      {isRefetching && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      )}
      {isLoading && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      )}
      {data && (
        <>
          <div className="flex w-full h-[25rem]  relative ">
            <GoBack />
            <div className="absolute top-4 z-10 right-3 flex-col space-y-0.5">
              <div className="">
                <IoReload
                  onClick={() => refetch()}
                  className="h-8 w-8 mb-2  backdrop-blur-md text-white bg-black/30 rounded-full p-1.5"
                />
              </div>
              {isSaved && isSaved.length == 0 && (
                <div className=" ">
                  <AddAlbum
                    clone={true}
                    id={id}
                    name={data[0]?.artists[0].name}
                    album={data[0]?.album}
                    image={data[0]?.thumbnailUrl.replace(
                      "w120-h120",
                      "w1080-h1080"
                    )}
                  />
                </div>
              )}
              {playingPlaylistUrl == id && (
                <div className="" onClick={handleFocus}>
                  <RiFocus3Line className="h-8 w-8 fade-in  backdrop-blur-md text-white bg-black/30 rounded-full p-1.5" />
                </div>
              )}
            </div>

            <img
              width="100%"
              height="100%"
              src={data[0]?.thumbnailUrl.replace("w120-h120", "w1080-h1080")}
              alt="Image"
              loading="lazy"
              className="object-cover opacity-80 h-[100%] w-[100%]"
            />

            <div className=" absolute bottom-5 px-4 left-0  right-0">
              <h1 className="text-center  font-semibold py-2 text-2xl capitalize">
                {data[0]?.album}
              </h1>
              <div className="flex space-x-4 py-1 justify-center  items-center w-full">
                <Button
                  onClick={handlePlay}
                  type="button"
                  variant={"secondary"}
                  className="text-lg py-6 text-black shadow-none bg-white/95 rounded-lg px-[13dvw]"
                >
                  <FaPlay className="mr-2" />
                  Play
                </Button>
                <Button
                  type="button"
                  onClick={handleShufflePlay}
                  variant={"secondary"}
                  className="text-lg py-6 text-black shadow-none bg-white/95 rounded-lg px-[12dvw]"
                >
                  <RxShuffle className="mr-2" />
                  Shuffle
                </Button>
              </div>
            </div>
          </div>
          <div className="py-3 pb-[9.5rem]">
            {data.map((data, i) => (
              <div
                onClick={handleArtist}
                key={data.artists[0].id + i + data.title}
              >
                <Songs
                  p={id || ""}
                  query="album"
                  link={false}
                  artistId={data.artists[0]?.id || artistId.get("id") || ""}
                  audio={data.youtubeId}
                  key={data.youtubeId + i}
                  id={i}
                  title={data.title}
                  artist={data.artists[0]?.name}
                  cover={data.thumbnailUrl}
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
const AlbumPage = React.memo(AlbumPageComp);

export default AlbumPage;
