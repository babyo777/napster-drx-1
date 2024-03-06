import { GetArtistDetails, GetPlaylistHundredSongsApi } from "@/API/api";
import { ArtistDetails, favArtist, playlistSongs } from "@/Interface";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { IoReload } from "react-icons/io5";
import { useQuery } from "react-query";
import { useParams } from "react-router-dom";
import SuggestedArtist from "./SuggestedArtist";
import ArtistAlbums from "./ArtistAlbums";
import Loader from "@/components/Loaders/Loader";
import GoBack from "@/components/Goback";
import { useCallback, useEffect, useState } from "react";
import { DATABASE_ID, FAV_ARTIST, db } from "@/appwrite/appwriteConfig";
import { ID, Query } from "appwrite";
import { FaRegStar } from "react-icons/fa";
import { RxShuffle } from "react-icons/rx";
import {
  SetPlaylistOrAlbum,
  isLoop,
  play,
  setCurrentIndex,
  setPlayingPlaylistUrl,
  setPlaylist,
  shuffle,
} from "@/Store/Player";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/Store/Store";
import { FaStar } from "react-icons/fa6";

function ArtistPage() {
  const dispatch = useDispatch();
  const { id } = useParams();
  const [isFavArtist, setIsFavArtist] = useState<boolean>();
  const getArtistDetails = async () => {
    const list = await axios.get(`${GetArtistDetails}${id}`);
    return list.data as ArtistDetails;
  };

  const loadIsFav = async () => {
    const r = await db.listDocuments(DATABASE_ID, FAV_ARTIST, [
      Query.equal("for", [localStorage.getItem("uid") || "default"]),
      Query.equal("artistId", [id || "none"]),
    ]);
    const p = r.documents as unknown as favArtist[];
    if (p.length == 0) {
      setIsFavArtist(false);
    } else {
      setIsFavArtist(true);
    }
    return p;
  };

  const { data: isFav, refetch: refetchFav } = useQuery<favArtist[]>(
    ["checkFavArtist", id],
    loadIsFav,
    {
      refetchOnWindowFocus: false,
      keepPreviousData: true,
    }
  );

  const addToFav = async () => {
    setIsFavArtist(true);
    await db
      .createDocument(DATABASE_ID, FAV_ARTIST, ID.unique(), {
        artistId: id,
        name: data?.name,
        thumbnailUrl: data?.thumbnails[0].url,
        for: localStorage.getItem("uid"),
      })
      .catch(() => setIsFavArtist(true));
    refetchFav();
  };

  const removeFromFav = async () => {
    if (isFav) {
      setIsFavArtist(false);

      await db
        .deleteDocument(DATABASE_ID, FAV_ARTIST, isFav[0].$id)
        .catch(() => setIsFavArtist(false));
      refetchFav();
    }
  };

  const { data, isLoading, isError, refetch, isRefetching } =
    useQuery<ArtistDetails>(["artist", id], getArtistDetails, {
      retry: 5,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 60 * 60000,
    });

  const getPlaylist = async () => {
    const list = await axios.get(
      `${GetPlaylistHundredSongsApi}${
        data?.songsPlaylistId.replace("VL", "") || ""
      }`
    );

    return list.data as playlistSongs[];
  };

  const { data: song, refetch: songRefetch } = useQuery<playlistSongs[]>(
    ["playlist", id],
    getPlaylist,
    {
      enabled: false,
      retry: 5,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      staleTime: 60 * 60000,
    }
  );
  const isPlaying = useSelector(
    (state: RootState) => state.musicReducer.isPlaying
  );
  useEffect(() => {
    if (data) {
      songRefetch();
    }
  }, [data, songRefetch]);

  const handleShufflePlay = useCallback(async () => {
    if (song) {
      dispatch(setPlaylist(song));
      dispatch(shuffle(song));
      dispatch(SetPlaylistOrAlbum("library"));
      dispatch(setCurrentIndex(0));
      dispatch(
        setPlayingPlaylistUrl(data?.songsPlaylistId.replace("VL", "") || "")
      );

      if (song.length == 1) {
        dispatch(isLoop(true));
      } else {
        dispatch(isLoop(false));
      }
      if (!isPlaying) {
        dispatch(play(true));
      }
    }
  }, [dispatch, song, isPlaying, data?.songsPlaylistId]);
  return (
    <>
      {isError && (
        <div className=" relative  w-full">
          <div className="fixed  top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            No artist found
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
        <div className="flex w-full h-[25rem]  relative ">
          <GoBack />

          <div className=" absolute top-4 z-10 right-3">
            <IoReload
              onClick={() => refetch()}
              className="h-8 w-8  backdrop-blur-md text-white bg-black/30 rounded-full p-1.5"
            />
          </div>
          <div className="absolute top-[3.6rem] z-10 right-3">
            {isFavArtist ? (
              <FaStar
                onClick={removeFromFav}
                className="h-8 w-8  backdrop-blur-md fade-in  bg-black/30 rounded-full p-1.5"
              />
            ) : (
              <FaRegStar
                onClick={addToFav}
                className="h-8 w-8  backdrop-blur-md fade-in  bg-black/30 rounded-full p-1.5"
              />
            )}
          </div>
          <img
            width="100%"
            height="100%"
            src={
              data.thumbnails[0]?.url.replace("w540-h225", "w1080-h1080") ||
              "/favicon.jpeg"
            }
            alt="Image"
            loading="lazy"
            className="object-cover opacity-80 h-[100%] w-[100%]"
          />

          <div className=" absolute bottom-5 px-4 left-0  right-0">
            <h1 className="text-center  font-semibold py-2 text-2xl capitalize">
              {data?.name}
            </h1>
            <div className="flex space-x-4 py-1 justify-center  items-center w-full">
              <Button
                type="button"
                onClick={handleShufflePlay}
                variant={"secondary"}
                className="text-lg py-6 text-zinc-100 shadow-none bg-white/20 backdrop-blur-md rounded-lg px-[12dvw]"
              >
                <RxShuffle className="mr-2" />
                Shuffle
              </Button>
            </div>
          </div>
        </div>
      )}

      {data && data.albums.length > 0 && (
        <div className="flex flex-col">
          <div className="flex  px-4 py-2 pt-3 ">
            <h1 className="text-start font-semibold text-xl">Albums</h1>
          </div>
          <div className="flex overflow-x-scroll -space-x-4  items-center">
            {data &&
              data.albums.map((s) => (
                <ArtistAlbums
                  artistId={id}
                  key={s.albumId}
                  title={s.title}
                  thumbnailUrl={s.thumbnailUrl}
                  type={s.type}
                  year={s.year}
                  albumId={s.albumId}
                />
              ))}
          </div>
        </div>
      )}

      {data && data.singles.length > 0 && (
        <div className="flex flex-col">
          <div className="flex  px-4 py-2 pt-3 ">
            <h1 className="text-start font-semibold text-xl">Singles</h1>
          </div>
          <div className="flex overflow-x-scroll -space-x-4  items-center">
            {data &&
              data.singles.map((s) => (
                <ArtistAlbums
                  artistId={id}
                  key={s.albumId}
                  title={s.title}
                  thumbnailUrl={s.thumbnailUrl}
                  type={s.type}
                  year={s.year}
                  albumId={s.albumId}
                />
              ))}
          </div>
        </div>
      )}
      {data && data.suggestedArtists.length == 0 && (
        <div className="pb-40"></div>
      )}
      {data && data.suggestedArtists.length > 0 && (
        <div className="flex flex-col">
          <div className="flex  px-4 py-2 pt-3 ">
            <h1 className="text-start font-semibold text-xl">You might like</h1>
          </div>
          <div className="flex overflow-x-scroll -space-x-4 items-center">
            {data &&
              data.suggestedArtists.map((s) => (
                <SuggestedArtist
                  key={s.artistId}
                  artistId={s.artistId}
                  name={s.name}
                  thumbnailUrl={s.thumbnailUrl}
                />
              ))}
          </div>
        </div>
      )}
    </>
  );
}

export default ArtistPage;
