const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');

const auth = require('../../middleware/auth');
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

//@route  POST api/posts
//@desc   Creating POST for user
//@access Private

router.post(
  '/',
  [auth, [check('text', 'Text is Required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      });
      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.error(error.message);
      res.status(500).send('Server Error');
    }
  }
);

//@route  GET api/posts
//@desc   Get all posts
//@access Private

router.get('/', auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('serverError');
  }
});

//@route  GET api/posts/:id
//@desc   Get Post by ID
//@access Private

router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ mgs: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ mgs: 'Post not found' });
    }
    console.error(error.message);
    res.status(500).send('serverError');
  }
});
//@route  DELETE api/posts/:id
//@desc   Delete Post by ID
//@access Private

router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check user

    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ mgs: 'User not authorized' });
    }
    if (!post) {
      return res.status(404).json({ mgs: 'Post not found' });
    }
    await post.remove();
    res.json({ mgs: 'Post Removed' });
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ mgs: 'Post not found' });
    }
    console.error(error.message);
    res.status(500).send('serverError');
  }
});

//@route  PUT api/posts/like/:id
//@desc   Like a Post
//@access Private

router.put('/like/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id).length >
      0
    ) {
      return res.status(400).json({ mgs: 'Post already Liked' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});
//@route  PUT api/posts/unlike/:id
//@desc   Like a Post
//@access Private

router.put('/unlike/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //check if post has already been liked
    if (
      post.likes.filter((like) => like.user.toString() === req.user.id)
        .length === 0
    ) {
      return res.status(400).json({ mgs: 'Post has not yet been liked' });
    }
    //get remove index

    const removeIndex = post.likes
      .map((like) => like.user.toString())
      .indexOf(req.user.id);
    post.likes.splice(removeIndex, 1);
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.error(error.message);
    res.status(500).send('Server Error');
  }
});
//@route  POST api/posts/comment/:id
//@desc   Comment on a Post
//@access Private

router.post(
  '/comment/:id',
  [auth, [check('text', 'text is required').not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(500).json({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);
      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id,
      };
      post.comments.unshift(newComment);
      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.error(error.message);
      res.status(400).send('server Error');
    }
  }
);
//@route  Delete api/posts/comment/:id
//@desc   delete aComment on a Post
//@access Private

router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    const comment = post.comments.find(
      (comment) => comment.id === req.params.comment_id
    );

    //Make sure comment exists
    if (!comment) {
      return res.status(404).json({ mgs: 'Comment does not exists' });
    }
    if (res.user.id !== comment.user.toString()) {
      return res.status(401).json({ mgs: 'User not authorized' });
    }
    const removeIndex = post.comments
      .map((comment) => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.error(error.message);
    res.status(400).send('server Error');
  }
});

module.exports = router;
