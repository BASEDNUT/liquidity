import { useRouter } from 'next/router';

const PoolPage = () => {
  const router = useRouter();
  const { id } = router.query;

  return (
    <div>
      <h1>Pool Details</h1>
      <p>Pool ID: {id}</p>
    </div>
  );
};

export default PoolPage;
