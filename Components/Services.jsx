export default ({
  setOpenProfile,
  setCompleteModel,
  setStartModel,
  setGetModel, // Use uppercase "M" consistently
})  => {
  const team = [
    { title: "Complete Shipment" },
    { title: "Get Shipment" },
    { title: "Start Shipment" },
    { title: "Complete Shipment" },
    { title: "User Profile" },
    { title: "Shipment Count" },
  ];

  const openModel = (text) => {
    if (text === "Complete Shipment") {
      setCompleteModel(true);
    } else if (text === "Start Shipment") {
      setStartModel(true);
    } else if (text === "Get Shipment") {
      setGetModel(true); // Match prop name from parent
    } else if (text === "User Profile") {
      SetOpenProfile(true);
    }
  };
  

  return (
    <section className="py-8 bg-gray-50">
      <div className="container mx-auto px-6">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-gray-800">Dashboard</h2>
          <p className="text-gray-600">
            Choose an action to manage or view shipment details.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {team.map((item, i) => (
            <div
              key={i}
              className="flex flex-col justify-between bg-white shadow-md rounded-lg p-6 transition-transform transform hover:scale-105 hover:shadow-lg cursor-pointer"
              onClick={() => openModel(item.title)}
            >
              <h3 className="text-xl font-semibold text-gray-800 text-center">
                {item.title}
              </h3>
              <button className="mt-4 py-2 px-4 bg-blue-500 text-white font-medium rounded-lg hover:bg-blue-600">
                Open
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
