import React from "react";
import { 
  RawMaterialsIcon, 
  OrdersIcon, 
  PaymentsIcon, 
  ProductsIcon, 
  TrackingIcon,
  SupplierIcon,
  CustomerIcon,
  BlockchainIcon
} from "../Components/SVG";

export default function TestSVG() {
  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">SVG Icon Test</h1>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center border border-gray-600">
            <RawMaterialsIcon className="w-12 h-12 text-blue-400 mb-2" style={{ color: '#60a5fa', stroke: '#60a5fa' }} />
            <span className="text-sm font-medium text-white">Raw Materials</span>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center border border-gray-600">
            <OrdersIcon className="w-12 h-12 text-green-400 mb-2" style={{ color: '#4ade80', stroke: '#4ade80' }} />
            <span className="text-sm font-medium text-white">Orders</span>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center border border-gray-600">
            <PaymentsIcon className="w-12 h-12 text-purple-400 mb-2" style={{ color: '#c084fc', stroke: '#c084fc' }} />
            <span className="text-sm font-medium text-white">Payments</span>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center border border-gray-600">
            <ProductsIcon className="w-12 h-12 text-orange-400 mb-2" style={{ color: '#fb923c', stroke: '#fb923c' }} />
            <span className="text-sm font-medium text-white">Products</span>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center border border-gray-600">
            <TrackingIcon className="w-12 h-12 text-red-400 mb-2" style={{ color: '#f87171', stroke: '#f87171' }} />
            <span className="text-sm font-medium text-white">Tracking</span>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center border border-gray-600">
            <SupplierIcon className="w-12 h-12 text-indigo-400 mb-2" style={{ color: '#818cf8', stroke: '#818cf8' }} />
            <span className="text-sm font-medium text-white">Supplier</span>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center border border-gray-600">
            <CustomerIcon className="w-12 h-12 text-pink-400 mb-2" style={{ color: '#f472b6', stroke: '#f472b6' }} />
            <span className="text-sm font-medium text-white">Customer</span>
          </div>
          
          <div className="bg-gray-800 p-6 rounded-lg shadow-md flex flex-col items-center border border-gray-600">
            <BlockchainIcon className="w-12 h-12 text-cyan-400 mb-2" style={{ color: '#22d3ee', stroke: '#22d3ee' }} />
            <span className="text-sm font-medium text-white">Blockchain</span>
          </div>
        </div>
        
        <div className="mt-8 bg-gray-800 p-6 rounded-lg shadow-md border border-gray-600">
          <h2 className="text-xl font-bold mb-4 text-white">Different Sizes Test</h2>
          <div className="flex items-center space-x-4">
            <RawMaterialsIcon className="w-4 h-4 text-blue-400" style={{ color: '#60a5fa', stroke: '#60a5fa' }} />
            <RawMaterialsIcon className="w-6 h-6 text-blue-400" style={{ color: '#60a5fa', stroke: '#60a5fa' }} />
            <RawMaterialsIcon className="w-8 h-8 text-blue-400" style={{ color: '#60a5fa', stroke: '#60a5fa' }} />
            <RawMaterialsIcon className="w-12 h-12 text-blue-400" style={{ color: '#60a5fa', stroke: '#60a5fa' }} />
            <RawMaterialsIcon className="w-16 h-16 text-blue-400" style={{ color: '#60a5fa', stroke: '#60a5fa' }} />
          </div>
        </div>

        {/* Debug section */}
        <div className="mt-8 bg-yellow-900 p-6 rounded-lg shadow-md border border-yellow-600">
          <h2 className="text-xl font-bold mb-4 text-yellow-200">Debug Information</h2>
          <div className="text-yellow-100 space-y-2">
            <p>If you can see this yellow box but not the icons above, there's an SVG rendering issue.</p>
            <p>If the icons are invisible, they might be rendered with transparent stroke/fill.</p>
            <div className="mt-4 p-4 bg-yellow-800 rounded">
              <p className="mb-2">Raw SVG test (should be visible):</p>
              <svg className="w-8 h-8" fill="none" stroke="#60a5fa" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
