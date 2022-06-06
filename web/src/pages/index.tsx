import { NavBar } from "../components/NavBar"
import { withUrqlClient } from 'next-urql';
import { createUrqlClient } from "../utils/createUrqlClient";
import { usePostsQuery } from "../generated/graphql";

const Index = () => { 
  const [{data}] = usePostsQuery();
  return (
  <>
  <NavBar />
  <div>Hello world.</div>
  <br />
  {!data ? (
    <div>Loading...</div>
  ) : (data.posts.map(p => <div key={p.id}>{p.title}</div>))}
  </>
  )
}

// Server-side rendering means it is IMMEDIATELY available (can see inside view page source)
// This is great for SEO purposes, but can be taxing on server
// Are you doing any queries? If so, is it worth SEO-ing?
export default withUrqlClient(createUrqlClient, {ssr: true})(Index);
