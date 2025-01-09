// import {useState} from 'react';
// import {str1} from "../Components/index"

// export default ({startModal, setStartModal,startShipment}) => {
//   const[getProduct,setGetProduct] = useState({receiver:"",index:""});
// const startShipment =  () => {
//   startShipment(getProduct);
// };
// return startModal ? (
//   <div className='fixed insert-0 z-10 overflow-y-auto'>
//     <div className='fixed insert-0 bg-black bg-opacity-50'>
//       onclick={() => setStartModal(false)}
//       </div>
//     <div className='flex items-center min-h-screen p-6'>
//       <div className='relative w-full max-w-md mx-auto bg-white rounded-md shadow-md'>
//         <div className='flex justify-end'>
//           <button
//             className='p-2 text-lg font-bold text-white bg-red-500 rounded-full'
//             onclick={() => setStartModal(false)}
//           >
//             X
//           </button>

//     </div>
//     <div className ="max-w-sm mx-auto py-3 space-y-3 text-center">
//       <h4 className="text-2xl font-bold text-gray-900">Start Shipment
//       </h4>
//       <form onSubmit={(e)=> e.preventDefault()}>
//         <div className="relative mt-3">
//           <input
//           type="text"
//           placeholder="receiver"
//           className='w-full px-4 py-2 border border-gray-300 rounded-md'
//           value={getProduct.receiver}
//           onChange={(e) => setGetProduct({...getProduct, receiver: e.target.value})}
// ></input>
//         </div>
// <div className="relative mt-3">
//   <input
//   type="text"
//   placeholder="ID"
//   className='w-full px-4 py-2 border border-gray-300 rounded-md'
//   value={getProduct.index}
//   onChange={(e) => setGetProduct({...getProduct, index: e.target.value})}
// ></input>
// </div>
// <button
// onclick={()=>startShipment()}>Get Details</button>
//       </form>
//     </div>
//   </div>
// </div>
// </div>
// ) : null;
// };
import { useState } from "react";
import { str1 } from "../Components/index";

export default ({ startModal, setStartModal, startShipment }) => {
  const [getProduct, setGetProduct] = useState({ receiver: "", index: "" });

  const handleStartShipment = () => {
    startShipment(getProduct);
  };

  return startModal ? (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black bg-opacity-50"
        onClick={() => setStartModal(false)}
      ></div>
      <div className="flex items-center min-h-screen p-6">
        <div className="relative w-full max-w-md mx-auto bg-white rounded-md shadow-md">
          <div className="flex justify-end">
            <button
              className="p-2 text-lg font-bold text-white bg-red-500 rounded-full"
              onClick={() => setStartModal(false)}
            >
              X
            </button>
          </div>
          <div className="max-w-sm mx-auto py-3 space-y-3 text-center">
            <h4 className="text-2xl font-bold text-gray-900">Start Shipment</h4>
            <form onSubmit={(e) => e.preventDefault()}>
              <div className="relative mt-3">
                <input
                  type="text"
                  placeholder="receiver"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  value={getProduct.receiver}
                  onChange={(e) =>
                    setGetProduct({ ...getProduct, receiver: e.target.value })
                  }
                />
              </div>
              <div className="relative mt-3">
                <input
                  type="text"
                  placeholder="ID"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md"
                  value={getProduct.index}
                  onChange={(e) =>
                    setGetProduct({ ...getProduct, index: e.target.value })
                  }
                />
              </div>
              <button
                type="button"
                className="w-full px-4 py-2 mt-4 text-white bg-blue-500 rounded-md"
                onClick={handleStartShipment}
              >
                Get Details
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};
