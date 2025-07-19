import { Link } from "react-router-dom";
import MainCategories from "../components/MainCategories";
import FeaturedPosts from "../components/FeaturedPosts";
import PostList from "../components/PostList";

const Homepage = () => {
  return (
    <div className="mt-4 flex flex-col gap-4">
      {/* BREADCRUMB */}
      <div className="flex gap-4 text-white">
        <Link to="/">Home</Link>
        <span>•</span>
        <span className="text-blue-500">Blogs and Articles</span>
      </div>
      {/* INTRODUCTION */}
      <div className="flex items-center justify-between">
        {/* titles */}
        <div className="">
          <h1 className=" titleAcp text-2xl md:text-5xl lg:text-6xl ">BlOg</h1>
          <p className="mt-8 text-white text-md md:text-xl">
            A blog forged in late-night sessions, fueled by bugs and
            breakthroughs. Here, we explore it all, trending topics, industry
            news, and what is next in the world of software engineering.
          </p>
        </div>
        {/* animated button */}
        <Link to="write" className="hidden md:block relative">
          <svg
            viewBox="0 0 200 200"
            width="200"
            height="200"
            className="text-lg tracking-widest animate-spin animatedButton"
          >
            <path
              id="circlePath"
              fill="none"
              d="M 100, 100 m -75, 0 a 75,75 0 1,1 150,0 a 75,75 0 1,1 -150,0"
            />
            <text fill="white">
              <textPath href="#circlePath" startOffset="0%">
                Click Here To •
              </textPath>
              <textPath href="#circlePath" startOffset="50%">
                Write Your Post •
              </textPath>
            </text>
          </svg>
          <button
            className="absolute top-0 left-0 right-0 bottom-0 m-auto w-20 h-20 acpBlue rounded-full flex items-center justify-center
                   transition-transform duration-300 ease-in-out hover:scale-110 hover:brightness-110"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="50"
              height="50"
              fill="none"
              stroke="white"
              strokeWidth="2"
            >
              <line x1="6" y1="18" x2="18" y2="6" />
              <polyline points="9 6 18 6 18 15" />
            </svg>
          </button>
        </Link>
      </div>
      {/* CATEGORIES */}
      <MainCategories />
      {/* FEATURED POSTS */}
      <FeaturedPosts />
      {/* POST LIST */}
      <div className="">
        <h1 className="my-8 text-2xl text-white">Recent Posts</h1>
        <PostList />
      </div>
    </div>
  );
};

export default Homepage;
