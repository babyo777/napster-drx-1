import { RootState } from "@/Store/Store";
import GoBack from "@/components/Goback";
import UpNextSongs from "./upNextSongs";
import { useSelector } from "react-redux";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { useDispatch } from "react-redux";
import { setPlaylist } from "@/Store/Player";
function Suggested() {
  const dispatch = useDispatch();

  const PlaylistOrAlbum = useSelector(
    (state: RootState) => state.musicReducer.PlaylistOrAlbum
  );

  const data = useSelector((state: RootState) => state.musicReducer.playlist);
  //@ts-expect-error:record
  const handleDragDrop = (result) => {
    const { source, destination, type } = result;
    if (!destination) return;

    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    )
      return;

    if (type === "group") {
      const reOrder = [...data];
      const storeSourceIndex = source.index;
      const storeDestinatonIndex = destination.index;

      const [removedStore] = reOrder.splice(storeSourceIndex, 1);
      reOrder.splice(storeDestinatonIndex, 0, removedStore);

      return dispatch(setPlaylist(reOrder));
    }
  };
  return (
    <div className=" flex flex-col items-center">
      <>
        <div className="flex w-full z-10 fixed h-[3rem]  ">
          <GoBack />
          <div className="absolute top-4 z-10 right-3 flex-col space-y-0.5">
            <div className="w-fit">
              <p className="fade-in mb-2 text-zinc-100  backdrop-blur-md bg-black/30 rounded-full p-1.5 px-2 w-fit">
                In beta not work properly
              </p>
            </div>
          </div>

          <div className=" absolute bottom-5  px-4 left-0  right-0">
            <h1 className="text-center  font-semibold py-2 text-2xl capitalize"></h1>
            <div className="flex space-x-4 py-1 px-2 justify-center  items-center w-full"></div>
          </div>
        </div>
        <div className="py-3 pt-14 pb-[8.5rem]">
          <DragDropContext onDragEnd={handleDragDrop}>
            <p className=" font-semibold text-xl mb-1">Up next</p>

            <Droppable droppableId="ROOT" type="group">
              {(p) => (
                <div
                  {...p.droppableProps}
                  className="pb-[1vh]"
                  ref={p.innerRef}
                >
                  {data.map((data, i) => (
                    <Draggable
                      draggableId={data.$id || data.youtubeId}
                      key={data.$id}
                      index={i}
                    >
                      {(p) => (
                        <div
                          {...p.dragHandleProps}
                          {...p.draggableProps}
                          ref={p.innerRef}
                        >
                          <UpNextSongs
                            current={false}
                            p={"suggested"}
                            where="suggested"
                            artistId={data.artists[0]?.id}
                            audio={data.youtubeId}
                            key={data.youtubeId + i}
                            id={i}
                            album={PlaylistOrAlbum == "album" && true}
                            title={data.title}
                            artist={data.artists[0]?.name}
                            cover={data.thumbnailUrl}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {p.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </>
    </div>
  );
}

export default Suggested;
