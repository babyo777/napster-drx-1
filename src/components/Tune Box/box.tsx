import { LazyLoadImage } from "react-lazy-load-image-component";
import { Input } from "../ui/input";
import { IoSearchOutline } from "react-icons/io5";
import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { playlistSongs } from "@/Interface";
import { SearchApi } from "@/API/api";
import { useQuery } from "react-query";
import Loader from "../Loaders/Loader";
import TuneSong from "./tuneSong";
import { Link, useParams } from "react-router-dom";
import { DATABASE_ID, NEW_USER, db } from "@/appwrite/appwriteConfig";
import { Models, Query } from "appwrite";
import { MdOutlineSpatialTracking } from "react-icons/md";
interface User extends Models.Document {
  name: string;
  image: string;
  notify: string;
}
function Box() {
  const searchQuery = useRef<HTMLInputElement>(null);
  const { id } = useParams();
  const [data, setData] = useState<playlistSongs[]>();
  const query = async () => {
    const query = searchQuery.current;
    if (query && query.value.length > 0) {
      const q = await axios.get(`${SearchApi}${searchQuery.current.value}`);
      setData(q.data);
      return q.data as playlistSongs[];
    } else {
      return [];
    }
  };

  const { isLoading, refetch } = useQuery<playlistSongs[]>(
    ["searchSong", searchQuery.current?.value],
    query,
    {
      enabled: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );
  const audioRef = useRef<HTMLAudioElement>(null);
  const handleChange = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.src = "";
    }
    const t = setTimeout(() => {
      if (searchQuery.current && searchQuery.current.value.length > 0) {
        setData([]);
        refetch();
      } else {
        setData([]);
      }
    }, 1000);
    return () => clearTimeout(t);
  }, [refetch]);

  const getUser = async () => {
    const user = await db.listDocuments(DATABASE_ID, NEW_USER, [
      Query.equal("user", [id ? id : ""]),
      Query.limit(1),
    ]);
    return user.documents as User[];
  };
  const { data: user, isLoading: userLoading } = useQuery<User[]>(
    ["user", id],
    getUser,
    {
      refetchOnMount: false,
      retry: 5,
      refetchOnWindowFocus: false,
    }
  );

  const [randomGradient, setRandomGradient] = useState<string>(
    "bg-gradient-to-br from-blue-500 to-purple-800"
  );

  const randomBg = () => {
    const random = Math.floor(Math.random() * 3);
    const gradient = [
      "bg-gradient-to-br from-blue-500 to-purple-800",
      "bg-gradient-to-br from-[#EC1187] to-[#FF8D10]",
      "bg-gradient-to-br from-pink-500 via-purple-600 to-purple-900",
    ];
    setRandomGradient(gradient[random]);
  };

  useEffect(() => {
    randomBg();
  }, []);

  return (
    <div
      className={`${randomGradient}  max-md:px-4 py-11 flex px-[35dvw] flex-col h-dvh justify-center space-y-1.5 items-center`}
    >
      <audio src="" hidden ref={audioRef} autoPlay></audio>
      {userLoading && !data ? (
        <div className=" h-dvh flex items-center justify-center">
          <Loader color="white" />
        </div>
      ) : (
        <>
          {user && user[0] ? (
            <>
              <div className="flex items-center space-x-1 absolute bottom-12 text-lg bg-black/15 font-semibold   animated-button animate-fade-up tracking-tight justify-center px-4 py-1.5 rounded-full">
                <Link
                  to={`${window.location.origin}/tunebox/${localStorage.getItem(
                    "uid"
                  )}`}
                >
                  Get Your Own
                </Link>
              </div>
              <div className="flex animate-fade-down w-full  bg-black/15 rounded-2xl  justify-between items-center p-2.5 space-x-1.5 pr-3">
                <div className=" flex items-center space-x-1.5">
                  <div>
                    <LazyLoadImage
                      alt="user"
                      className=" rounded-full"
                      src={user[0].image}
                      width={50}
                      height={50}
                      loading="lazy"
                    />
                  </div>
                  <div className=" flex flex-col items-start">
                    <h2 className="font-semibold capitalize tracking-tight leading-tight max-md:max-w-[30dvw] truncate ">
                      {user[0].name}
                    </h2>
                    <div className="flex text-sm space-x-1 leading-tight tracking-tight items-center">
                      <h1>Send me Tacks!</h1>
                    </div>
                  </div>
                </div>
                <div className="flex text-xl space-x-1.5 items-center">
                  <MdOutlineSpatialTracking className="h-7 w-7" />
                </div>
              </div>

              <div className="flex w-full  -space-x-2 animate-fade-up">
                <div className="border  bg-none rounded-lg rounded-r-none border-r-0 px-2 border-zinc-400">
                  <IoSearchOutline className=" mt-2 h-5 w-5" />
                </div>
                <Input
                  type="text"
                  ref={searchQuery}
                  onChange={handleChange}
                  placeholder="Search track and send"
                  className="  px-2 relative text-black font-semibold bg-none placeholder:text-white/70   border-zinc-400 shadow-none rounded-lg rounded-l-none border-l-0 "
                />
              </div>
              <div key={user[0].$id}>
                {isLoading && (
                  <div className=" py-11 flex items-center justify-center">
                    <Loader color="white" />
                  </div>
                )}
                {data &&
                  !isLoading &&
                  data.length > 0 &&
                  data
                    .slice(0, 5)
                    .map((item) => (
                      <TuneSong
                        notifyId={user[0]?.notify || null}
                        audioRef={audioRef}
                        key={item.youtubeId + item.thumbnailUrl}
                        item={item}
                      />
                    ))}
              </div>
            </>
          ) : (
            <div className=" h-dvh flex items-center justify-center">
              <p>
                Sorry, this page isn't available.{" "}
                <Link to={"/"} className="underline text-red-500">
                  Go back
                </Link>
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Box;
