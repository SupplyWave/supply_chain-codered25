// SPDX-License-Identifier: MIT
/*
pragma solidity ^0.8.0;

contract Tracking {
    enum ShipmentStatus { PENDING, IN_TRANSIT, DELIVERED }

    struct Shipment {
        address sender;
        address receiver;
        uint256 pickupTime;
        uint256 deliveryTime;
        uint256 distance;
        uint256 price;
        ShipmentStatus status;
        bool isPaid;
    }

    mapping(address => Shipment[]) public shipments;
    uint256 public shipmentCount;

    struct TypeShipment {
        address sender;
        address receiver;
        uint256 pickupTime;
        uint256 deliveryTime;
        uint256 distance;
        uint256 price;
        ShipmentStatus status;
        bool isPaid;
    }

    TypeShipment[] typeShipments;

    event ShipmentCreated(
        address indexed sender,
        address indexed receiver,
        uint256 pickupTime,
        uint256 distance,
        uint256 price
    );

    event ShipmentInTransit(
        address indexed sender,
        address indexed receiver,
        uint256 pickupTime
    );

    event ShipmentDelivered(
        address indexed sender,
        address indexed receiver,
        uint256 deliveryTime
    );

    event ShipmentPaid(
        address indexed sender,
        address indexed receiver,
        uint256 amount
    );

    constructor() {
        shipmentCount = 0;
    }

    function createShipment(
        address _receiver,
        uint256 _pickupTime,
        uint256 _distance,
        uint256 _price
    ) public payable {
        require(msg.value == _price, "Payment must be equal to the price");

        Shipment memory shipment = Shipment(
            msg.sender,
            _receiver,
            _pickupTime,
            0,
            _distance,
            _price,
            ShipmentStatus.PENDING,
            false
        );

        shipments[msg.sender].push(shipment);
        shipmentCount++;

        typeShipments.push(
            TypeShipment(
                msg.sender,
                _receiver,
                _pickupTime,
                0,
                _distance,
                _price,
                ShipmentStatus.PENDING,
                false
            )
        );

        emit ShipmentCreated(msg.sender, _receiver, _pickupTime, _distance, _price);
    }

function startShipment(address _sender,address _receiver,uint256 _index)
public {
    Shipment storage shipment = shipments[_sender][_index];
    TypeShipment storage typeShipment = typeShipments[_index];
    require(shipment.receiver == _receiver,"Invalid receiver.");
    require(shipment.status == ShipmentStatus.PENDING, "Shipment is already in transit");

    shipment.status = ShipmentStatus.IN_TRANSIT;
    typeShipment.status = ShipmentStatus.IN_TRANSIT;

    emit ShipmentInTransit (_sender, _receiver, shipment.pickupTime);
}

function completeShipment(address _sender,address _receiver,uint256 _index)
public {
    Shipment storage shipment = shipments[_sender][_index];
    TypeShipment storage typeShipment = typeShipments[_index];
    require(shipment.receiver == _receiver,"Invalid receiver.");
    require(shipment.status == ShipmentStatus.IN_TRANSIT, "Shipment is not in transit.");
    require(!shipment.isPaid,"Shipment already paid");

    shipment.status = ShipmentStatus.DELIVERED;
    typeShipment.status = ShipmentStatus.DELIVERED;
    typeShipment.deliveryTime= block.timestamp;
    uint256 amount = shipment.price;

    payable(shipment.sender).transfer(amount);
    shipment.isPaid = true;
    typeShipment.isPaid = true;

    emit ShipmentDelivered(_sender, _receiver, shipment.deliveryTime);
    emit ShipmentPaid (
        _sender, _receiver, amount
    );
}

function getShipment(address _sender, uint256 _index) 
    public 
    view 
    returns (
        address, 
        address, 
        uint256, 
        uint256, 
        uint256, 
        uint256, 
        ShipmentStatus, 
        bool
    ) 
{
    // Ensure shipments is properly indexed as a mapping or array
    Shipment memory shipment = shipments[_sender][_index];

    return (
        shipment.sender,
        shipment.receiver,
        shipment.pickupTime,
        shipment.deliveryTime,
        shipment.distance,
        shipment.price,
        shipment.status,
        shipment.isPaid
    );
}

function getShipmentCount(address _sender)public view returns(uint256) {
    return shipments[_sender].length;
}

function getAllTransactions()
 public
 view
 returns (TypeShipment[] memory)
 {
    return typeShipments;
 }

}
*/
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tracking {
    // Enum to represent the status of a shipment
    enum ShipmentStatus { PENDING, IN_TRANSIT, DELIVERED }

    // Struct to represent a shipment
    struct Shipment {
        address sender;
        address receiver;
        uint256 pickupTime;
        uint256 deliveryTime;
        uint256 distance;
        uint256 price;
        ShipmentStatus status;
        bool isPaid;
    }

    // Mapping to store shipments by sender address
    mapping(address => Shipment[]) public shipments;

    // Array to store all shipments for easier access
    Shipment[] public allShipments;

    // Events to log shipment actions
    event ShipmentCreated(
        address indexed sender,
        address indexed receiver,
        uint256 pickupTime,
        uint256 distance,
        uint256 price
    );

    event ShipmentInTransit(
        address indexed sender,
        address indexed receiver,
        uint256 pickupTime
    );

    event ShipmentDelivered(
        address indexed sender,
        address indexed receiver,
        uint256 deliveryTime
    );

    event ShipmentPaid(
        address indexed sender,
        address indexed receiver,
        uint256 amount
    );

    // Function to create a new shipment
    function createShipment(
        address _receiver,
        uint256 _pickupTime,
        uint256 _distance
    ) public payable {
        require(msg.value > 0, "Price must be greater than zero");
        
        // Create a new shipment
        Shipment memory shipment = Shipment({
            sender: msg.sender,
            receiver: _receiver,
            pickupTime: _pickupTime,
            deliveryTime: 0,
            distance: _distance,
            price: msg.value,
            status: ShipmentStatus.PENDING,
            isPaid: false
        });

        // Store the shipment
        shipments[msg.sender].push(shipment);
        allShipments.push(shipment);

        emit ShipmentCreated(msg.sender, _receiver, _pickupTime, _distance, msg.value);
    }

    // Function to start a shipment
    function startShipment(address _sender, uint256 _index) public {
        Shipment storage shipment = shipments[_sender][_index];
        require(shipment.receiver == msg.sender, "Invalid receiver.");
        require(shipment.status == ShipmentStatus.PENDING, "Shipment is already in transit");

        shipment.status = ShipmentStatus.IN_TRANSIT;

        emit ShipmentInTransit(_sender, shipment.receiver, shipment.pickupTime);
    }

    // Function to complete a shipment
    function completeShipment(address _sender, uint256 _index) public {
        Shipment storage shipment = shipments[_sender][_index];
        require(shipment.receiver == msg.sender, "Invalid receiver.");
        require(shipment.status == ShipmentStatus.IN_TRANSIT, "Shipment is not in transit.");
        require(!shipment.isPaid, "Shipment already paid");

        shipment.status = ShipmentStatus.DELIVERED;
        shipment.deliveryTime = block.timestamp;
        shipment.isPaid = true;

        // Transfer the payment to the sender
        payable(shipment.sender).transfer(shipment.price);

        emit ShipmentDelivered(_sender, shipment.receiver, shipment.deliveryTime);
        emit ShipmentPaid(_sender, shipment.receiver, shipment.price);
    }

    // Function to get a specific shipment
    function getShipment(address _sender, uint256 _index) 
        public 
        view 
        returns (
            address, 
            address, 
            uint256, 
            uint256, 
            uint256, 
            uint256, 
            ShipmentStatus, 
            bool
        ) 
    {
        Shipment memory shipment = shipments[_sender][_index];
        return (
            shipment.sender,
            shipment.receiver,
            shipment.pickupTime,
            shipment.deliveryTime,
            shipment.distance,
            shipment.price,
            shipment.status,
            shipment.isPaid
        );
    }

    // Function to get the count of shipments for a specific sender
    function getShipmentCount(address _sender) public view returns (uint256) {
        return shipments[_sender].length;
    }

    // Function to get all transactions (shipments)
    function getAllTransactions() public view returns (Shipment[] memory) {
        return allShipments;
    }
}