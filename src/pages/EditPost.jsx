import React, {useContext, useEffect, useState} from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { UserContext } from '../context/userContext';
import ReactQuill from 'react-quill'
import 'react-quill/dist/quill.snow.css'
import axios from 'axios';
import Loader from '../components/Loader';

const EditPost = () => {
  const [title,setTitle] = useState('')
  const [category,setCategory] = useState('Uncategorized')
  const [desc,setDesc] = useState('')
  const [thumbnail,setThumbnail] = useState('')
  const [error,setError] = useState('')
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate();
  const {id} = useParams();

  const {currentUser} = useContext(UserContext);
  const token = currentUser?.token;

  //redirect to login page if user isn't is logged in
  useEffect(() => {
    if(!token) {
      navigate('/login')
    }
  },[])

  const modules = {
    toolbar: [
      [ { 'header': [1, 2, 3, 4, 5, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image'],
      ['clean']
    ],
  }

  const formats = ['header','bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent','link', 'image']


  const POST_CATEGORIES = ["Agriculture", "Business", "Education", "Entertainment", "Art", "Investment",
    "Uncategorized", "Weather"] 


    useEffect(() => {
      const getPost = async () => {
        try {
          const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/posts/${id}`);
          setTitle(response.data.title);
          setDesc(response.data.desc);
          setCategory(response.data.category);
          setIsLoading(false); // Set loading to false once data is fetched
        } catch (err) {
          console.error('Error fetching post:', err);
          setIsLoading(false); // Set loading to false in case of an error
        }
      };
  
      getPost();
    }, [id]);
  
    const editPost = async (e) => {
      e.preventDefault();
  
      const postData = new FormData();
      postData.set('title', title);
      postData.set('category', category);
      postData.set('desc', desc);
      if (thumbnail) {
        postData.set('thumbnail', thumbnail);
      }
  
      try {
        const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/posts/${id}`, postData, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.status === 200) {
          navigate('/');
        }
      } catch (err) {
        setError(err.response?.data?.message || 'An error occurred while updating the post.');
      }
    };

    if(isLoading){
      return <Loader />
    }

  return (
    <section className="create-post">
      <div className="container">
        <h2>Edit Post</h2>
        {error && <p className="form_error-message">{error}</p>}
        <form className="form create-post_form" onSubmit={editPost}>
          <input type="text" placeholder='Title' value={title} onChange={e => setTitle(e.target.value)} autoFocus/>
          <select name="category" value={category} onChange={e => setCategory(e.target.value)}>
            {
              POST_CATEGORIES.map(cat => <option key={cat}>{cat}</option>)
            }
          </select>
          <ReactQuill modules={modules} formats={formats} value={desc} onChange={setDesc} />
          <input type="file" onChange={e => setThumbnail(e.target.files[0])} accept='png, jpg, jpeg' />
          <button type="submit" className='btn primary'>Update Post</button>
        </form>
      </div>
    </section>
  )
}

export default EditPost