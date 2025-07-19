import React from 'react';

const SampleUI = () => {
  return (
    <div className="min-h-screen bg-light p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="card mb-8 gradient-primary text-white">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Trust & Technology UI</h1>
              <p className="text-blue-100">Professional Supply Chain Interface</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold">$24,580</div>
              <div className="text-blue-200 text-sm">Total Revenue</div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card shadow-medium">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-primary font-semibold">Active Orders</h3>
                <div className="text-2xl font-bold text-primary">142</div>
              </div>
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card shadow-medium">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-primary font-semibold">Suppliers</h3>
                <div className="text-2xl font-bold text-secondary">28</div>
              </div>
              <div className="w-12 h-12 bg-secondary bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card shadow-medium">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-primary font-semibold">Completed</h3>
                <div className="text-2xl font-bold text-accent">89</div>
              </div>
              <div className="w-12 h-12 bg-accent bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="card shadow-medium">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-primary font-semibold">Revenue</h3>
                <div className="text-2xl font-bold text-primary">$45.2K</div>
              </div>
              <div className="w-12 h-12 bg-primary bg-opacity-10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Table */}
          <div className="lg:col-span-2">
            <div className="card shadow-medium">
              <div className="card-header">
                <h2 className="text-xl font-bold text-primary">Recent Transactions</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Transaction ID</th>
                      <th>Supplier</th>
                      <th>Amount</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="font-mono text-sm">#TXN-001</td>
                      <td>Acme Materials Ltd.</td>
                      <td className="font-semibold">$2,450</td>
                      <td><span className="badge badge-success">Completed</span></td>
                    </tr>
                    <tr>
                      <td className="font-mono text-sm">#TXN-002</td>
                      <td>Global Supplies Inc.</td>
                      <td className="font-semibold">$1,890</td>
                      <td><span className="badge badge-warning">Pending</span></td>
                    </tr>
                    <tr>
                      <td className="font-mono text-sm">#TXN-003</td>
                      <td>Tech Components Co.</td>
                      <td className="font-semibold">$3,200</td>
                      <td><span className="badge badge-info">Processing</span></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column - Actions & Info */}
          <div className="space-y-6">
            {/* Action Buttons */}
            <div className="card shadow-medium">
              <h3 className="text-lg font-semibold text-primary mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="btn btn-primary w-full">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Order
                </button>
                <button className="btn btn-secondary w-full">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  View Analytics
                </button>
                <button className="btn btn-accent w-full">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3a4 4 0 118 0v4m-4 8a2 2 0 100-4 2 2 0 000 4zm0 0v4a2 2 0 002 2h6a2 2 0 002-2v-4" />
                  </svg>
                  Manage Inventory
                </button>
                <button className="btn btn-outline w-full">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Settings
                </button>
              </div>
            </div>

            {/* Status Panel */}
            <div className="card shadow-medium">
              <h3 className="text-lg font-semibold text-primary mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-medium">Blockchain Network</span>
                  <span className="badge badge-success">Online</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-medium">Smart Contracts</span>
                  <span className="badge badge-success">Active</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-medium">API Services</span>
                  <span className="badge badge-warning">Maintenance</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-medium">Database</span>
                  <span className="badge badge-success">Connected</span>
                </div>
              </div>
            </div>

            {/* Form Example */}
            <div className="card shadow-medium">
              <h3 className="text-lg font-semibold text-primary mb-4">Quick Form</h3>
              <form className="space-y-4">
                <div>
                  <label className="form-label">Product Name</label>
                  <input type="text" className="form-input" placeholder="Enter product name" />
                </div>
                <div>
                  <label className="form-label">Category</label>
                  <select className="form-input">
                    <option>Raw Materials</option>
                    <option>Electronics</option>
                    <option>Textiles</option>
                  </select>
                </div>
                <div>
                  <label className="form-label">Description</label>
                  <textarea className="form-input" rows="3" placeholder="Product description"></textarea>
                </div>
                <button type="submit" className="btn btn-primary w-full">
                  Submit Form
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SampleUI;
