import Songs from "./Songs";
import { Button } from "../ui/button";
import { FaPlay } from "react-icons/fa6";
import { IoIosArrowBack } from "react-icons/io";
import { IoReload } from "react-icons/io5";
import { NavLink, useParams } from "react-router-dom";
import { useQuery } from "react-query";
import axios from "axios";
import { SearchPlaylist, playlistSongs, savedPlaylist } from "@/Interface";
import Loader from "../Loaders/Loader";
import { RxShuffle } from "react-icons/rx";
import {
  // GetPlaylistHundredSongsApi,
  GetPlaylistSongsApi,
  SearchPlaylistApi,
  getPlaylistDetails,
} from "@/API/api";
import { useDispatch, useSelector } from "react-redux";
import {
  SetPlaylistOrAlbum,
  isLoop,
  play,
  setCurrentIndex,
  setIsLikedSong,
  setPlayingPlaylistUrl,
  setPlaylist,
  setPlaylistUrl,
  shuffle,
} from "@/Store/Player";
import React, { useCallback, useEffect } from "react";
import { RootState } from "@/Store/Store";
import AddLibrary from "./AddLibrary";
import GoBack from "../Goback";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/blur.css";
import {
  DATABASE_ID,
  PLAYLIST_COLLECTION_ID,
  db,
} from "@/appwrite/appwriteConfig";
import { Query } from "appwrite";
function LibraryComp() {
  const dispatch = useDispatch();
  const { id } = useParams();

  const loadSavedPlaylist = async () => {
    const r = await db.listDocuments(DATABASE_ID, PLAYLIST_COLLECTION_ID, [
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

  const playlistUrl = useSelector(
    (state: RootState) => state.musicReducer.playlistUrl
  );
  const getPlaylist = async () => {
    const list = await axios.get(`${GetPlaylistSongsApi}${id}`);
    return list.data as playlistSongs[];
  };

  const getPlaylistDetail = async () => {
    const list = await axios.get(`${getPlaylistDetails}${id}`);
    return list.data as SearchPlaylist[];
  };

  const getPlaylistThumbnail = async () => {
    const list = await axios.get(`${SearchPlaylistApi}${id}`);
    return list.data as SearchPlaylist[];
  };

  const isPlaying = useSelector(
    (state: RootState) => state.musicReducer.isPlaying
  );
  const { data, isLoading, isError, refetch, isRefetching } = useQuery<
    playlistSongs[]
  >(["playlist", id], getPlaylist, {
    retry: 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 60 * 60000,
  });

  const {
    data: pDetails,
    isLoading: pLoading,
    isError: pError,
    refetch: pRefetch,
    isRefetching: pIsRefetching,
  } = useQuery<SearchPlaylist[]>(["playlistDetails", id], getPlaylistDetail, {
    retry: 5,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    staleTime: 60 * 60000,
  });
  const {
    data: playlistThumbnail,
    isLoading: playlistThumbnailLoading,
    isError: playlistThumbnailError,
    refetch: playlistThumbnailRefetch,
    isRefetching: playlistThumbnailIsRefetching,
  } = useQuery<SearchPlaylist[]>(
    ["getPlaylistThumbnail", id],
    getPlaylistThumbnail,
    {
      retry: 5,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 60 * 60000,
    }
  );

  useEffect(() => {
    dispatch(setIsLikedSong(false));
    if (id && id !== playlistUrl) {
      dispatch(setPlaylistUrl(id));
    }
  }, [dispatch, id, playlistUrl]);
  const handleShufflePlay = useCallback(async () => {
    if (data) {
      dispatch(shuffle(data));
      dispatch(setCurrentIndex(0));
      dispatch(setPlayingPlaylistUrl(id || ""));
      dispatch(SetPlaylistOrAlbum("library"));
      if (data.length == 1) {
        dispatch(isLoop(true));
      } else {
        dispatch(isLoop(false));
      }
      if (!isPlaying) {
        dispatch(play(true));
      }
    }
  }, [dispatch, data, isPlaying, id]);
  const handlePlay = useCallback(() => {
    if (data) {
      dispatch(setPlaylist(data));
      dispatch(setCurrentIndex(0));
      dispatch(setPlayingPlaylistUrl(id || ""));
      dispatch(SetPlaylistOrAlbum("library"));
      if (data.length == 1) {
        dispatch(isLoop(true));
      } else {
        dispatch(isLoop(false));
      }
      if (!isPlaying) {
        dispatch(play(true));
      }
    }
  }, [dispatch, data, isPlaying, id]);

  return (
    <div className=" flex flex-col items-center">
      {isError && pError && playlistThumbnailError && (
        <div className=" relative  w-full">
          <div className="fixed  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            No playlist found
          </div>
          <NavLink to={"/library/"}>
            <IoIosArrowBack className="h-7 w-7  my-5 mx-4  backdrop-blur-md text-black bg-white/70 rounded-full p-1" />
          </NavLink>
        </div>
      )}
      {isRefetching && pIsRefetching && playlistThumbnailIsRefetching && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      )}
      {isLoading && pLoading && playlistThumbnailLoading && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      )}
      {!data && (
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
          <Loader />
        </div>
      )}
      {data && (
        <>
          <div className="flex w-full h-[23rem]   relative ">
            <GoBack />

            <div className=" absolute top-4 z-10 right-3">
              <IoReload
                onClick={() => (
                  refetch(), pRefetch(), playlistThumbnailRefetch()
                )}
                className="h-8 w-8 fade-in  backdrop-blur-md text-white bg-black/30 rounded-full p-1.5"
              />
            </div>
            {isSaved && isSaved.length == 0 && (
              <div className=" absolute top-[3.6rem] z-10 right-3">
                <AddLibrary clone={true} id={id} />
              </div>
            )}

            <LazyLoadImage
              effect="blur"
              width="100%"
              height="100%"
              src={
                (playlistThumbnail &&
                  playlistThumbnail[0]?.thumbnailUrl.replace(
                    "w120-h120",
                    "w1080-h1080"
                  )) ||
                data[0]?.thumbnailUrl.replace("w120-h120", "w1080-h1080")
              }
              alt="Image"
              loading="lazy"
              className="object-cover opacity-80 h-[100%] w-[100%]"
            />

            <div className=" absolute bottom-5  px-4 left-0  right-0">
              <h1 className="text-center  font-semibold py-2 text-2xl capitalize">
                {(pDetails && pDetails[0]?.title) || ""}
              </h1>
              <div className="flex space-x-4 py-1 px-2 justify-center  items-center w-full">
                <Button
                  onClick={handlePlay}
                  type="button"
                  variant={"secondary"}
                  className="text-base py-5 text-zinc-100 shadow-none bg-white/20 backdrop-blur-md rounded-lg px-14"
                >
                  <FaPlay className="mr-2" />
                  Play
                </Button>
                <Button
                  type="button"
                  onClick={handleShufflePlay}
                  variant={"secondary"}
                  className="text-base py-5 text-zinc-100 shadow-none bg-white/20 backdrop-blur-md rounded-lg px-14"
                >
                  <RxShuffle className="mr-2" />
                  Shuffle
                </Button>
              </div>
            </div>
          </div>
          <div className="py-3 pb-[9.5rem]">
            {data.map((data, i) => (
              <Songs
                p={id || ""}
                artistId={data.artists[0]?.id}
                audio={data.youtubeId}
                key={data.youtubeId + i}
                id={i}
                title={data.title}
                artist={data.artists[0]?.name}
                cover={data.thumbnailUrl}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
const Library = React.memo(LibraryComp);
export default Library;
