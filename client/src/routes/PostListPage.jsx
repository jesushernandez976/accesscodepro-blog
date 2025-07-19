import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import PostList from "../components/PostList";
import SideMenu from "../components/SideMenu";

const PostListPage = () => {
  const [open, setOpen] = useState(false);
  const [searchParams] = useSearchParams();
  
  // Get the category from URL parameters
  const category = searchParams.get('cat');

  return (
    <div className="">
      <h1 className="mb-8 text-2xl text-white">
        {category ? `${category.charAt(0).toUpperCase() + category.slice(1)} Posts` : "General Blog"}
      </h1>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="acpBlue text-sm text-white px-4 py-2 rounded-2xl mb-4 md:hidden"
      >
        {open ? "Close" : "Filter or Search"}
      </button>
      <div className="flex flex-col-reverse gap-8 md:flex-row justify-between">
        <div className="">
          <PostList />
        </div>
        <div className={`${open ? "block" : "hidden"} md:block`}>
          <SideMenu />
        </div>
      </div>
    </div>
  );
};

export default PostListPage;