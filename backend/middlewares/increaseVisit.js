import Post from "../models/post.model.js";

const increaseVisit = async (req, res, next) => {
  try {
    const slug = req.params.slug;
    
    if (!slug) {
      return next();
    }
    
    await Post.findOneAndUpdate(
      { slug }, 
      { $inc: { visit: 1 } }
    );
    
    next();
  } catch (error) {
    console.error('Error incrementing visit count:', error);
    next();
  }
};

export default increaseVisit;
