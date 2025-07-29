import { Link, useParams } from "react-router-dom";
import Image from "../components/Image";
import PostMenuActions from "../components/PostMenuActions";
import Search from "../components/Search";
import Comments from "../components/Comments";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { format } from "timeago.js";

const fetchPost = async (slug) => {
  const res = await axios.get(`${import.meta.env.VITE_API_URL}/posts/${slug}`);
  return res.data;
};

const SinglePostPage = () => {
  const { slug } = useParams();

  const { isPending, error, data } = useQuery({
    queryKey: ["post", slug],
    queryFn: () => fetchPost(slug),
  });
  if (isPending) return <p className="text-white">Loading...</p>;
  if (error)
    return (
      <p className="text-white">
        Timed out, Please reload page {error.message}
      </p>
    );
  if (!data) return <p className="text-white">Post not found!</p>;

  return (
    <div className="flex flex-col gap-8">
      {/* detail */}
      <div className="flex gap-8">
        <div className="lg:w-3/5 flex flex-col gap-8">
          <h1 className="text-xl text-white md:text-3xl xl:text-4xl 2xl:text-5xl font-semibold">
            {data.title}
          </h1>
          <div className="flex items-center gap-2 text-gray-400 text-sm">
            <span>Written by</span>
            <Link className="text-blue-800">{data.user.username}</Link>
            <span>on</span>
            <Link className="text-blue-800">{data.category}</Link>
            <span>{format(data.createdAt)}</span>
          </div>
          <p className="text-gray-500 font-medium">{data.desc}</p>
        </div>
        {data.img && (
          <div className="hidden lg:block w-2/5">
            <Image src={data.img} w="600" className="rounded-2xl" />
          </div>
        )}
      </div>
      {/* content */}
      <div className="flex flex-col md:flex-row gap-12 justify-between">
        {/* post text */}
        <div className="lg:text-lg flex flex-col gap-6 text-white text-justify">
          <div
            className="prose prose-invert text-white max-w-none"
            dangerouslySetInnerHTML={{ __html: data.content }}
          />
        </div>
        {/* menu */}
        <div className="px-4 h-max sticky top-8">
          <h1 className="mb-4 text-sm font-medium text-white">Author</h1>
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-8">
              {data?.user?.img && (
                <Image
                  src={data.user.img}
                  className="w-12 h-12 rounded-full object-cover"
                  w="48"
                  h="48"
                />
              )}

              <Link className="text-blue-800">{data?.user?.username}</Link>
            </div>
            <p className="text-sm text-gray-500">
              Follow for more content and updates
            </p>
            <div className="flex gap-2">
              <a
                href="https://www.instagram.com/accesscodepro/"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-200 hover:scale-110"
              >
                <div className="w-8 h-8">
                  <Image
                    src="ig logo.png"
                    alt="Instagram"
                    width={100}
                    height={100}
                    className="w-full h-full object-contain"
                  />
                </div>
              </a>
              <a
                href="https://www.tiktok.com/@accesscodepro"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-200 hover:scale-110"
              >
                <div className="w-8 h-8">
                  <Image
                    src="tik logo.png"
                    alt="tik tok logo"
                    width={100}
                    height={100}
                    className="w-full h-full object-contain"
                  />
                </div>
              </a>
              <a
                href="https://x.com/accesscodepro"
                target="_blank"
                rel="noopener noreferrer"
                className="transition-transform duration-200 hover:scale-110"
              >
                <div className="w-8 h-8">
                  <Image
                    src="x logo.png"
                    alt="x logo"
                    width={100}
                    height={100}
                    className="w-full h-full object-contain"
                  />
                </div>
              </a>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-400 text-sm mb-4 mt-5">
            <span>
              {data.visit.toLocaleString()}{" "}
              {data.visit === 1 ? "view" : "views"}
            </span>
          </div>

          <PostMenuActions post={data} />
          <h1 className="mt-8 mb-4 text-sm font-medium text-white">
            Categories
          </h1>
          <div className="flex flex-col gap-2 text-sm text-white">
            <Link className="underline " to="/posts">
              All
            </Link>
            <Link className="underline" to="/posts?cat=Web Design">
              Web Design
            </Link>
            <Link className="underline" to="/posts?cat=Development">
              Development
            </Link>
            <Link className="underline" to="/posts?cat=Tools">
              Tools
            </Link>
            <Link className="underline" to="/posts?cat=Business">
              Business
            </Link>
            <Link className="underline" to="/posts?cat=Marketing">
              Marketing
            </Link>
          </div>
          <h1 className="mt-8 mb-4 text-sm font-medium text-white">Search</h1>
          <Search />
        </div>
      </div>
      <Comments postId={data._id} />
    </div>
  );
};

export default SinglePostPage;
