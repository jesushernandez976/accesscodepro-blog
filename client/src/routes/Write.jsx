import { useAuth, useUser } from "@clerk/clerk-react";
import ReactQuill from "react-quill-new";
import "react-quill/dist/quill.snow.css";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Upload from "../components/Upload";

const Write = () => {
  const { isLoaded, isSignedIn } = useUser();
  const [value, setValue] = useState("");
  const [cover, setCover] = useState("");
  const [img, setImg] = useState("");
  const [video, setVideo] = useState("");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (img?.url) {
      setValue((prev) => prev + `<p><img src="${img.url}" /></p>`);
    }
  }, [img]);

  useEffect(() => {
    if (video?.url) {
      setValue(
        (prev) =>
          prev + `<p><iframe class="ql-video" src="${video.url}"></iframe></p>`
      );
    }
  }, [video]);

  const navigate = useNavigate();

  const { getToken } = useAuth();

  const mutation = useMutation({
    mutationFn: async (newPost) => {
      const token = await getToken();
      return axios.post(`${import.meta.env.VITE_API_URL}/posts`, newPost, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    onSuccess: (res) => {
      toast.success("Post has been created");

      
      setValue(""); // clear ReactQuill
      setCover(""); // reset cover image
      setImg(""); // reset inline image
      setVideo(""); // reset video
      setProgress(0); // reset progress bar

      
      document.querySelector("form").reset();

      
      setTimeout(() => {
        navigate(`/${res.data.slug}`);
      }, 500);
    },
  });

  if (!isLoaded) {
    return <div className="text-white">Loading...</div>;
  }

  if (isLoaded && !isSignedIn) {
    return (
      <div className="flex items-center justify-center h-screen text-white text-2xl font-bold">
        Please Log In
      </div>
    );
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    const data = {
      img: cover.filePath || "",
      title: formData.get("title"),
      category: formData.get("category"),
      desc: formData.get("desc"),
      content: value,
    };

    console.log(data);

    mutation.mutate(data);
  };

  // const onError = (err) => {
  //   console.log(err);
  //   toast.error("image upload failed");
  // };

  // const onSuccess = (res) => {
  //   console.log(res);
  //   setCover(res);
  // };

  return (
    <div className="h-[calc(100vh-64px)] md:h-[calc(100vh-80px)] flex flex-col gap-6">
      <h1 className="text-cl font-light text-white">Create a New Post</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 flex-1 mb-6">
        <Upload type="image" setProgress={setProgress} setData={setCover}>
          <button className="w-max p-2 shadow-md rounded-xl text-sm text-gray-500 bg-white">
            Add a cover image
          </button>
        </Upload>
        <input
          className="text-4xl text-white font-semibold bg-transparent outline-none"
          type="text"
          placeholder="Title Here"
          name="title"
        />
        <div className="flex items-center gap-4">
          <label htmlFor="" className="text-sm text-white">
            Choose a category:
          </label>
          <select
            name="category"
            id=""
            className="p-2 rounded-xl bg-white shadow-md"
          >
            <option value="General">General</option>
            <option value="Web Design">Web Design</option>
            <option value="Development">Development</option>
            <option value="Tools">Tools</option>
            <option value="Business">Business</option>
            <option value="Marketing">Marketing</option>
          </select>
        </div>
        <textarea
          className="p-4 rounded-xl bg-white shadow-md"
          name="desc"
          placeholder="A Short Description"
        />
        <div className="flex flex-1 ">
          <div className="flex flex-col gap-2 mr-2">
            <Upload type="image" setProgress={setProgress} setData={setImg}>
              <input
                type="file"
                accept="image/*"
                id="imageUpload"
                style={{ display: "none" }}
                onChange={(e) => setImg(e.target.files[0])}
              />
              <label htmlFor="imageUpload">
                <button className="bg-blue-600 text-white px-4 py-2 rounded mr-4">
                  🌆 Upload Image
                </button>
              </label>
            </Upload>
            <Upload type="video" setProgress={setProgress} setData={setVideo}>
              <input
                type="file"
                accept="video/*"
                id="videoUpload"
                style={{ display: "none" }}
                onChange={(e) => setVideo(e.target.files[0])}
              />
              <label htmlFor="videoUpload">
                <button className="bg-green-600 text-white px-4 py-2 rounded">
                  ▶️ Upload Video
                </button>
              </label>
            </Upload>
          </div>
          <ReactQuill
            theme="snow"
            className="flex-1 rounded-xl bg-white shadow-md"
            value={value}
            onChange={setValue}
            readOnly={0 < progress && progress < 100}
          />
        </div>
        <button
          disabled={mutation.isPending || (0 < progress && progress < 100)}
          className="acpBlue text-white font-medium rounded-xl mt-4 p-2 w-36 disabled:bg-blue-400 disabled:cursor-not-allowed"
        >
          {mutation.isPending ? "Loading..." : "Send"}
        </button>
        {"Progress:" + progress}
        {/* {mutation.isError && <span>{mutation.error.message}</span>} */}
      </form>
    </div>
  );
};

export default Write;
