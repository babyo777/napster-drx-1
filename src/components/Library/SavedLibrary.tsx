import Header from "../Header/Header";
import SavedLibraryCard from "./SavedLibraryCard";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setPlaylistUrl,
  setSavedAlbums,
  setSavedArtists,
  setSavedPlaylist,
} from "@/Store/Player";
import { RootState } from "@/Store/Store";
import SkeletonP from "./SkeletonP";
import {
  ALBUM_COLLECTION_ID,
  DATABASE_ID,
  FAV_ARTIST,
  PLAYLIST_COLLECTION_ID,
  db,
} from "@/appwrite/appwriteConfig";
import { Query } from "appwrite";
import { savedPlaylist, suggestedArtists } from "@/Interface";
import { useQuery } from "react-query";
import { Link } from "react-router-dom";
import { AspectRatio } from "@radix-ui/react-aspect-ratio";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { GrNext } from "react-icons/gr";
import { ToggleLibrary } from "./Toggle";
import SavedAlbumCard from "./savedAAlbums";
import { ArtistSearch } from "./savedArtists";

function SavedLibraryComp() {
  const dispatch = useDispatch();
  const savedPlaylist = useSelector(
    (state: RootState) => state.musicReducer.savedPlaylist
  );
  const savedAlbums = useSelector(
    (state: RootState) => state.musicReducer.savedAlbums
  );
  const currentToggle = useSelector(
    (state: RootState) => state.musicReducer.currentToggle
  );
  const savedArtists = useSelector(
    (state: RootState) => state.musicReducer.savedArtists
  );
  const loadSavedPlaylist = async () => {
    const r = await db.listDocuments(DATABASE_ID, PLAYLIST_COLLECTION_ID, [
      Query.orderDesc("$createdAt"),
      Query.equal("for", [localStorage.getItem("uid") || "default", "default"]),
    ]);
    const p = r.documents as unknown as savedPlaylist[];
    return p;
  };
  const { data, isLoading } = useQuery("savedPlaylist", loadSavedPlaylist, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const loadSavedAlbums = async () => {
    const r = await db.listDocuments(DATABASE_ID, ALBUM_COLLECTION_ID, [
      Query.orderDesc("$createdAt"),
      Query.equal("for", [localStorage.getItem("uid") || "default"]),
    ]);
    const p = r.documents as unknown as savedPlaylist[];
    return p;
  };
  const { data: SavedAlbums } = useQuery("savedAlbums", loadSavedAlbums, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });
  const loadSavedArtists = async () => {
    const r = await db.listDocuments(DATABASE_ID, FAV_ARTIST, [
      Query.orderDesc("$createdAt"),
      Query.equal("for", [localStorage.getItem("uid") || "default"]),
    ]);
    const p = r.documents as unknown as suggestedArtists[];
    return p;
  };
  const { data: SavedArtists } = useQuery("savedArtists", loadSavedArtists, {
    refetchOnWindowFocus: false,
    keepPreviousData: true,
  });

  useEffect(() => {
    dispatch(setSavedPlaylist([]));
    dispatch(setPlaylistUrl(""));
    if (data) {
      if (SavedAlbums) {
        dispatch(setSavedAlbums(SavedAlbums));
      }
      if (SavedArtists) {
        dispatch(setSavedArtists(SavedArtists));
      }
      dispatch(setSavedPlaylist([...data]));
    }
  }, [dispatch, data, SavedAlbums, SavedArtists]);

  return (
    <>
      <Header title="Library" l={true} />
      <ToggleLibrary />
      {currentToggle === "Playlists" && savedPlaylist.length > 0 && (
        <Link to={`/liked/${localStorage.getItem("uid")}`}>
          <div className="flex space-x-2 px-5 mb-3 items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="overflow-hidden h-[3.4rem]  w-[3.4rem] ">
                <AspectRatio ratio={1 / 1}>
                  <LazyLoadImage
                    height="100%"
                    width="100%"
                    effect="blur"
                    src="/liked.webp"
                    alt="Image"
                    className="rounded-lg object-cover w-[100%] h-[100%]"
                  />
                </AspectRatio>
              </div>
              <div className="flex flex-col  text-xl text-start">
                <p className="w-[59vw] fade-in text-lg truncate">Liked Songs</p>
                <p className="-mt-2  text-xs w-[50vw] truncate h-2"></p>
              </div>
            </div>

            <GrNext className="h-5  w-5" />
          </div>
        </Link>
      )}
      {isLoading && (
        <div className="flex fade-in space-y-3  flex-col px-5">
          <SkeletonP />
          <SkeletonP />
          <SkeletonP />
          <SkeletonP />
        </div>
      )}

      <div className="flex fade-in pb-40 flex-col px-5">
        <div className="pb-36 space-y-3">
          {currentToggle === "Playlists" &&
            savedPlaylist.map((saved, id) => (
              <SavedLibraryCard
                key={saved.link + id}
                id={saved.$id || ""}
                author={saved.creator}
                link={saved.link}
                f={saved.for}
              />
            ))}

          {currentToggle === "Albums" &&
            savedAlbums.map((saved, id) => (
              <SavedAlbumCard
                key={saved.link + id}
                id={saved.$id || ""}
                author={saved.creator}
                album={saved.name}
                Image={saved.image}
                link={saved.link}
                f={saved.for}
              />
            ))}
          {currentToggle === "Artists" &&
            savedArtists.map((saved, id) => (
              <ArtistSearch
                key={saved.artistId + id}
                artistId={saved.artistId}
                name={saved.name}
                thumbnailUrl={saved.thumbnailUrl}
              />
            ))}
        </div>
      </div>
    </>
  );
}
const SavedLibrary = React.memo(SavedLibraryComp);

export default SavedLibrary;
