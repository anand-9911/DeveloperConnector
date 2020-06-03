import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { getPostById } from '../../actions/post';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Spinner from '../layout/Spinner';
import AddComment from './AddComment';
import CommentItem from './CommentItem';

const Discussion = ({ location, getPostById }) => {
  useEffect(() => {
    const { id } = location.state;
    getPostById(id);
  }, [getPostById, location.state]);

  const { postFromLink } = location.state;
  const { _id, text, name, avatar, comments } = postFromLink;
  return (
    <>
      {postFromLink === null ? (
        <Spinner />
      ) : (
        <>
          <Link to='/posts' class='btn'>
            Back To Posts
          </Link>
          <div class='post bg-white p-1 my-1'>
            <div>
              <img class='round-img' src={avatar} alt='avatar' />
              <h4>{name}</h4>
            </div>
            <div>
              <p class='my-1'>{text}</p>
            </div>
          </div>
          <AddComment id={_id} />
          {comments.length > 0 ? (
            comments.map((comment) => (
              <CommentItem postId={_id} comment={comment} />
            ))
          ) : (
            <h4>No comments</h4>
          )}
        </>
      )}
    </>
  );
};

Discussion.propTypes = {
  getPostById: PropTypes.func.isRequired,
};

export default connect(null, { getPostById })(Discussion);