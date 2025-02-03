import Link from "next/link";

export default function Home() {
  return (
    <div className="home-wrapper flex justify-center items-center min-h-screen bg-gray-100">
      <Link href="/store-owner" className="bg-blue-500 hover:bg-blue-700 px-8 py-4 text-2xl rounded text-white font-bold mx-6">Store Owner</Link>
      <Link href="/pizza-chef" className="bg-green-500 hover:bg-green-700 px-8 py-4 text-2xl rounded text-white font-bold mx-6">Pizza Chef</Link>
    </div>

  );
}
