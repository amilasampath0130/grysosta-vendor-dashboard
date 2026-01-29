'use client';
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();
  return (
    <div className="w-full h-full ">
      <div className="grid lg:grid-cols-3 md:grid-cols-2 sm:grid-cols-2 gap-5">
        {/* // Sales Card 1 */}
        <div
          className=" w-full h-50 bg-green-500 rounded-lg  items-center justify-center hover:scale-105 duration-300 shadow-lg"
          onClick={() => router.push("/vendor/dashboard/create-offer")}
        >
          <h1 className="pt-3 text-center col-span-4 font-bold text-lg text-white">
            Create a offer
          </h1>
          <h1 className="text-center col-span-4 font-semibold text-2xl"></h1>
        </div>
        <div
          className=" w-full h-50 bg-green-500 rounded-lg  items-center justify-center hover:scale-105 duration-300 shadow-lg"
          onClick={() => router.push("/vendor/dashboard/create-advertisement")}
        >
          <h1 className="pt-3 text-center col-span-4 font-bold text-lg text-white">
            Create advertisement
          </h1>
          <h1 className="text-center col-span-4 font-semibold text-2xl"></h1>
        </div>
        <div className=" w-full h-50 bg-green-500 rounded-lg  items-center justify-center hover:scale-105 duration-300 shadow-lg">
          <h1 className="text-center col-span-4 font-bold text-lg text-white"></h1>
          <h1 className="text-center col-span-4 font-semibold text-2xl"></h1>
        </div>
      </div>
    </div>
  );
};
export default Dashboard;
