import React, {useContext, useEffect, useState} from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import { FaEdit,FaCheck } from "react-icons/fa";
import axios from 'axios';

const UserProfile = () => {
  const[avatar,setAvatar] = useState('');
  const[name,setName] = useState('');
  const[email,setEmail] = useState('');
  const[currentPassword,setCurrentPassword] = useState('');
  const[newPassword,setNewPassword] = useState('');
  const[confirmNewPassword,setConfirmNewPassword] = useState('');
  const [error, setError] = useState('');

  const[isAvatarTouched, setIsAvatarTouched] = useState(false);

  const navigate = useNavigate();

  const {currentUser} = useContext(UserContext);
  const token = currentUser?.token;

  //redirect to login page if user isn't is logged in
  useEffect(() => {
    if(!token) {
      navigate('/login')
    }
  },[])


  useEffect(() => {
    const getUser = async () => {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_BASE_URL}/users/${currentUser.id}`,
          { withCredentials: true, headers: { Authorization: `Bearer ${token}` } }
        );
        const { name, email, avatar } = response.data;
        setName(name);
        setEmail(email);
        setAvatar(avatar);
      } catch (error) {
        // Handle error, e.g., log it or set an error state
        console.error('Error fetching user data:', error);
      }
    };
  
    getUser();
  }, [currentUser.id, token]);
  

  const handleAvatarChange = (e) => {
    setIsAvatarTouched(true);
    setAvatar(e.target.files[0]);
};

  const changeAvatarHandler = async () => {
    setIsAvatarTouched(false);
    try {
      const postData = new FormData();
      postData.set('avatar',avatar);
      const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/users/change-avatar`, postData,
      {withCredentials:true , headers: {Authorization: `Bearer ${token}`}})
      setAvatar(response?.data.avatar)
    } catch (err) {
      console.log(err)
    }
  }


  const updateUserDetail = async (e) => {
    e.preventDefault();

    try {
      const userData = new FormData();
      userData.set('name',name);
      userData.set('email',email);
      userData.set('currentPassword',currentPassword);
      userData.set('newPassword',newPassword);
      userData.set('confirmNewPassword',confirmNewPassword);

      const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/users/edit-user`, userData,
      {withCredentials:true, headers: {Authorization: `Bearer ${token}`}})

      if(response.status == 200){
        //logout user
        navigate('/logout')
      }
    } catch (err) {
      setError(err.response.data.message);
    }
  }

  return (
    <section className="profile">
      <div className="container profile_container">
        <Link to={`/myposts/${currentUser.id}`} className='btn'>My posts</Link>

        <div className="profile_details">
          <div className="avatar_wrapper">
            <div className="profile_avatar">
            {console.log(`${process.env.REACT_APP_ASSETS_URL}/uploads/${avatar}`)}

              <img src={`${process.env.REACT_APP_ASSETS_URL}/uploads/${avatar}`} alt="" />
            </div>
            {/* Form to update avatar */}
            <form className="avatar_form">
              <input type="file" name="avatar" id="avatar" onChange={handleAvatarChange}
               accept="png, jpg, jpeg"/>
              <label htmlFor="avatar" onClick={() => setIsAvatarTouched(true)}><FaEdit /></label>
            </form>
            {isAvatarTouched && <button className="profile_avatar-btn" onClick={changeAvatarHandler}><FaCheck/></button>}
          </div>

          <h1 className='profile_name'>{currentUser.name}</h1>

          {/* Form to update user details */}
          <form className="form profile_form" onSubmit={updateUserDetail}>
            {error && <p className="form_error-message">{error}</p>}
            <input type="text" placeholder='Full Name' value={name} onChange={e => setName(e.target.value)} />
            <input type="email" placeholder='Email' value={email} onChange={e => setEmail(e.target.value)} />
            <input type="password" placeholder='Current Password' value={currentPassword} onChange={e =>
             setCurrentPassword(e.target.value)} />
            <input type="password" placeholder='New Password' value={newPassword} onChange={e =>
             setNewPassword(e.target.value)} />
             <input type="password" placeholder='Confirm New Password' value={confirmNewPassword} onChange={e =>
             setConfirmNewPassword(e.target.value)} />
             <button type="submit" className='btn primary'>Update Details</button>
          </form>
        </div>
      </div>
    </section>
  )
}

export default UserProfile