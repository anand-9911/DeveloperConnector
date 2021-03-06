import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import Moment from 'react-moment';
import moment from 'moment';

import { connect } from 'react-redux';
import { deletePost, removeLike, addLike } from '../../actions/post';

const PostItem = ({ post, auth, deletePost, addLike, removeLike }) => {
  const { _id, text, name, avatar, user, likes, date, comments } = post;
  return (
    <>
      <div className='post bg-white p-1 my-1'>
        <div>
          <Link to='/main-profile'>
            <img className='round-img' src={avatar} alt='avatar' />
            <h4>{name}</h4>
          </Link>
        </div>
        <div>
          <p className='my-1'>{text}</p>
          <p className='post-date'>
            Posted on <Moment format='YYYY/MM/DD'>{moment.utc(date)}</Moment>{' '}
          </p>
          <button
            type='button'
            className='btn btn-light'
            onClick={(e) => addLike(_id)}>
            <i className='fas fa-thumbs-up'></i>{' '}
            <span>{likes.length > 0 && <span>{likes.length}</span>}</span>
          </button>
          <button
            type='button'
            className='btn btn-light'
            onClick={(e) => removeLike(_id)}>
            <i className='fas fa-thumbs-down'></i>
          </button>
          <Link
            to={{
              pathname: '/discussion',
              state: { id: _id },
            }}
            className='btn btn-primary'>
            Discussion{' '}
            <span className='comment-count'>
              {comments.length > 0 ? (
                <span>{comments.length}</span>
              ) : (
                <span>0</span>
              )}
            </span>
          </Link>
          {auth.user._id === user && (
            <button
              type='button'
              className='btn btn-danger'
              onClick={(e) => deletePost(_id)}>
              <i className='fas fa-times'></i>
            </button>
          )}
        </div>
      </div>
    </>
  );
};

PostItem.propTypes = {
  post: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  deletePost: PropTypes.func.isRequired,
  addLike: PropTypes.func.isRequired,
  removeLike: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
  auth: state.authReducer,
});

export default connect(mapStateToProps, { deletePost, addLike, removeLike })(
  PostItem
);
