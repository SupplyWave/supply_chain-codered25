// import { useState } from "react";
// export default ({getModel,steGetModel,getShipment}) => {
//   const[index,setIndex]=useState(0);
//   const [SingleShipmentData,setSingleShipmentData]=useState();

//   const getShipmentData=async()=>{
//       const getData=await getShipment(index);
//       setSingleShipmentData(getData);
//       console.log(getData);
//   };
//        console.log(SingleShipmentData);

//        const converTime =(time)=>{
//         const newTime = new Date(time);
//         const dataTime = new Intl.DateTimeFormat("en-US", {
//           year: "numeric",
//           month: "2-digit",
//           day: "2-digit",
//         }).format(newTime);
//         return dataTime;
//        };
//   return getModel ? (
//     <div className="fixed inset-0 z-10 overflow-y-auto">
//       <div
//         className="fixed inset-0 w-full h-full bg-black opacity-40"
//         onClick={() => setGetModel(false)}
//       ></div>
//       <div className="flex items-center min-h-screen px-4 py-8">
//         <div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
//           <div className="flex justify-end">
//             <button
//               className="p-2 text-gray-400 rounded-md hover:bg-gray-100"
//               onClick={() => setGetModel(false)}
//             >
//               <svg
//                 xmlns="http://www.w3.org/
//                 2000/svg"
//                 className="w-5 h-5 mx-auto"
//                 viewBox="0 0 20 20"
//                 fill="currentColor"
//               >
//               <path
//         fillRule="evenodd"
//         d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
//         clipRule="evenodd"
//       />
//       </svg>
//       </button>
//       </div>
//       <div className="max-w-sm mx-auto py-3 space-y-3 text-center">
//         <h4 className="text-lg font-medium text-gray-800">
//           Product Tracking Details

//         </h4>
//         <form onSubmit={(e)=>e.preventDefault()}>
//           <div className="relative mt-4">
//             <input
//             type="number"
//             placeholder="ID"
//             className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded"
//             onChange={(e=> setIndex(e.target.value))}
//             />
//             <button onClick={getShipmentData} className="w-full mt-4 bg-gray-800 text-white py-2 rounded">Get deatils</button>
//             </form>
//             {SingleShipmentData == undefined ? (
//               "") : (
//                 <div className="mt-4">
//                   <p>Sender: {SingleShipmentData.sender.slice(0,25)}...</p>
//                   <p>Receiver: {SingleShipmentData.receiver.slice(0,25)}...</p>
//                   <p>Pickup Time: {converTime(SingleShipmentData.pickupTime)}</p>
//                   <p>Delivery Time: {converTime(SingleShipmentData.deliveryTime)}</p>
//                   <p>Distance: {SingleShipmentData.distance}</p>
//                   <p>Price: {SingleShipmentData.price}</p>
//                   <p>Status: {SingleShipmentData.status}</p>
//                   <p>
//                     paid:{" "}
//                     {SingleShipmentData.isPaid ? "Complete" : "Not Complete"}
//                   </p>
//                 </div>
//               )}
//       </div>
//       </div>
//       </div>
//       </div>
//       </div>
//   ) : (
//     ""
//   );
// };
import { useState } from "react";
export default ({ getModel, setGetModel, getShipment }) => {
  const [index, setIndex] = useState(0);
  const [SingleShipmentData, setSingleShipmentData] = useState();

  const getShipmentData = async () => {
    try {
      if (!index || isNaN(index)) {
        alert("Please enter a valid ID.");
        return;
      }
      const getData = await getShipment(index);
      setSingleShipmentData(getData);
      console.log(getData);
    } catch (error) {
      console.error("Error fetching shipment data:", error);
    }
  };

  const converTime = (time) => {
    const newTime = new Date(time);
    const dataTime = new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(newTime);
    return dataTime;
  };

  return getModel ? (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div
        className="fixed inset-0 w-full h-full bg-black opacity-40"
        onClick={() => setGetModel(false)}
      ></div>
      <div className="flex items-center min-h-screen px-4 py-8">
        <div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg">
          <div className="flex justify-end">
            <button
              className="p-2 text-gray-400 rounded-md hover:bg-gray-100"
              onClick={() => setGetModel(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5 mx-auto"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
          <div className="max-w-sm mx-auto py-3 space-y-3 text-center">
            <h4 className="text-lg font-medium text-gray-800">
              Product Tracking Details
            </h4>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative mt-4">
                <input
                  type="number"
                  placeholder="ID"
                  className="w-full px-4 py-2 text-gray-700 bg-gray-200 rounded"
                  onChange={(e) => setIndex(e.target.value)}
                />
                <button
                  onClick={getShipmentData}
                  className="w-full mt-4 bg-gray-800 text-white py-2 rounded"
                >
                  Get details
                </button>
              </div>
            </form>
            {SingleShipmentData === undefined ? (
              ""
            ) : (
              <div className="mt-4">
                <p>
                  Sender:{" "}
                  {SingleShipmentData.sender
                    ? SingleShipmentData.sender.slice(0, 25)
                    : "N/A"}
                  ...
                </p>
                <p>
                  Receiver:{" "}
                  {SingleShipmentData.receiver
                    ? SingleShipmentData.receiver.slice(0, 25)
                    : "N/A"}
                  ...
                </p>
                <p>
                  Pickup Time:{" "}
                  {SingleShipmentData.pickupTime
                    ? converTime(SingleShipmentData.pickupTime)
                    : "N/A"}
                </p>
                <p>
                  Delivery Time:{" "}
                  {SingleShipmentData.deliveryTime
                    ? converTime(SingleShipmentData.deliveryTime)
                    : "N/A"}
                </p>
                <p>Distance: {SingleShipmentData.distance || "N/A"}</p>
                <p>Price: {SingleShipmentData.price || "N/A"}</p>
                <p>Status: {SingleShipmentData.status || "N/A"}</p>
                <p>
                  Paid:{" "}
                  {SingleShipmentData.isPaid
                    ? "Complete"
                    : "Not Complete"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  ) : (
    ""
  );
};
