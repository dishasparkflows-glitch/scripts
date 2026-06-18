const mongoose = require('mongoose');
const mongoDB = require('./db');

const ModuleFieldSchema = new mongoose.Schema(
  {},
  {
    strict: false,
    collection: 'module_fields'
  }
);

const ModuleField = mongoDB.model('module_fields', ModuleFieldSchema);

const modules111 =[
  {
    "name": "account",
    "connectedmodule": [
      "branches",
      "accountcategory",
      "accountsubcategory",
      "saletransection",
      "salereturntransection",
      "banktransection",
      "cashtransection",
      "ratefixtransection",
      "goldtransection",
      "approvaltransection",
      "ledger",
      "occupation"
    ],
    "relations": [
      {
        "module": "branches",
        "localField": "branchid",
        "foreignField": "_id"
      },
      {
        "module": "accountcategory",
        "localField": "accountcategory",
        "foreignField": "_id"
      },
      {
        "module": "accountsubcategory",
        "localField": "accountsubcategory",
        "foreignField": "_id"
      },
      {
        "module": "saletransection",
        "localField": "_id",
        "foreignField": "accountid"
      },
      {
        "module": "salereturntransection",
        "localField": "_id",
        "foreignField": "accountid"
      },
      {
        "module": "banktransection",
        "localField": "_id",
        "foreignField": "accountid"
      },
      {
        "module": "cashtransection",
        "localField": "_id",
        "foreignField": "accountid"
      },
      {
        "module": "ratefixtransection",
        "localField": "_id",
        "foreignField": "accountid"
      },
      {
        "module": "goldtransection",
        "localField": "_id",
        "foreignField": "accountid"
      },
      {
        "module": "approvaltransection",
        "localField": "_id",
        "foreignField": "accountid"
      },
      {
        "module": "ledger",
        "localField": "_id",
        "foreignField": "accountid"
      },
      {
        "module": "occupation",
        "localField": "occupation",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "accountcategory",
    "connectedmodule": [
      "account",
      "accountsubcategory"
    ],
    "relations": [
      {
        "module": "account",
        "localField": "_id",
        "foreignField": "accountcategory"
      },
      {
        "module": "accountsubcategory",
        "localField": "_id",
        "foreignField": "accountcategory"
      }
    ]
  },
  {
    "name": "accountsubcategory",
    "connectedmodule": [
      "accountcategory",
      "account"
    ],
    "relations": [
      {
        "module": "accountcategory",
        "localField": "accountcategory",
        "foreignField": "_id"
      },
      {
        "module": "account",
        "localField": "_id",
        "foreignField": "accountsubcategory"
      }
    ]
  },
  {
    "name": "attempts",
    "connectedmodule": [
      "branches",
      "customers",
      "cart",
      "orders"
    ],
    "relations": [
      {
        "module": "branches",
        "localField": "branchid",
        "foreignField": "_id"
      },
      {
        "module": "customers",
        "localField": "customerid",
        "foreignField": "_id"
      },
      {
        "module": "cart",
        "localField": "_id",
        "foreignField": "attemptid"
      },
      {
        "module": "orders",
        "localField": "_id",
        "foreignField": "attemptid"
      }
    ]
  },
  {
    "name": "bank",
    "connectedmodule": [
      "branches"
    ],
    "relations": [
      {
        "module": "branches",
        "localField": "branchid",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "banktransection",
    "connectedmodule": [
      "branches",
      "account",
      "salesman"
    ],
    "relations": [
      {
        "module": "branches",
        "localField": "branchid",
        "foreignField": "_id"
      },
      {
        "module": "account",
        "localField": "accountid",
        "foreignField": "_id"
      },
      {
        "module": "salesman",
        "localField": "salesmanid",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "branches",
    "connectedmodule": [
      "account",
      "attempts",
      "bank",
      "banktransection",
      "cart",
      "cashtransection",
      "counter",
      "saletransection",
      "salereturntransection",
      "ratefixtransection",
      "goldtransection",
      "approvaltransection",
      "helper",
      "ledger"
    ],
    "relations": [
      {
        "module": "account",
        "localField": "_id",
        "foreignField": "branchid"
      },
      {
        "module": "attempts",
        "localField": "_id",
        "foreignField": "branchid"
      },
      {
        "module": "bank",
        "localField": "_id",
        "foreignField": "branchid"
      },
      {
        "module": "banktransection",
        "localField": "_id",
        "foreignField": "branchid"
      },
      {
        "module": "cart",
        "localField": "_id",
        "foreignField": "branchid"
      },
      {
        "module": "cashtransection",
        "localField": "_id",
        "foreignField": "branchid"
      },
      {
        "module": "counter",
        "localField": "_id",
        "foreignField": "branchid"
      },
      {
        "module": "saletransection",
        "localField": "_id",
        "foreignField": "branchid"
      },
      {
        "module": "salereturntransection",
        "localField": "_id",
        "foreignField": "branchid"
      },
      {
        "module": "ratefixtransection",
        "localField": "_id",
        "foreignField": "branchid"
      },
      {
        "module": "goldtransection",
        "localField": "_id",
        "foreignField": "branchid"
      },
      {
        "module": "approvaltransection",
        "localField": "_id",
        "foreignField": "branchid"
      },
      {
        "module": "helper",
        "localField": "_id",
        "foreignField": "branchid"
      },
      {
        "module": "ledger",
        "localField": "_id",
        "foreignField": "branchid"
      }
    ]
  },
  {
    "name": "cart",
    "connectedmodule": [
      "branches",
      "attempts",
      "customers",
      "wishlist"
    ],
    "relations": [
      {
        "module": "branches",
        "localField": "branchid",
        "foreignField": "_id"
      },
      {
        "module": "attempts",
        "localField": "attemptid",
        "foreignField": "_id"
      },
      {
        "module": "customers",
        "localField": "customerid",
        "foreignField": "_id"
      },
      {
        "module": "wishlist",
        "localField": "wishlistid",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "cashtransection",
    "connectedmodule": [
      "branches",
      "account",
      "salesman"
    ],
    "relations": [
      {
        "module": "branches",
        "localField": "branchid",
        "foreignField": "_id"
      },
      {
        "module": "account",
        "localField": "accountid",
        "foreignField": "_id"
      },
      {
        "module": "salesman",
        "localField": "salesmanid",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "category",
    "connectedmodule": [
      "inventory",
      "itemlist"
    ],
    "relations": [
      {
        "module": "inventory",
        "localField": "_id",
        "foreignField": "category"
      },
      {
        "module": "itemlist",
        "localField": "_id",
        "foreignField": "category"
      }
    ]
  },
  {
    "name": "catelogue",
    "connectedmodule": [
      "designmaster"
    ],
    "relations": [
      {
        "module": "designmaster",
        "localField": "designmasterid",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "city",
    "connectedmodule": [
      "area"
    ],
    "relations": [
      {
        "module": "area",
        "localField": "_id",
        "foreignField": "cityid"
      }
    ]
  },
  {
    "name": "color",
    "connectedmodule": [
      "inventory"
    ],
    "relations": [
      {
        "module": "inventory",
        "localField": "_id",
        "foreignField": "color"
      }
    ]
  },
  {
    "name": "counter",
    "connectedmodule": [
      "branches",
      "inventory",
      "helper"
    ],
    "relations": [
      {
        "module": "branches",
        "localField": "branchid",
        "foreignField": "_id"
      },
      {
        "module": "inventory",
        "localField": "_id",
        "foreignField": "counter"
      }
    ]
  },
  {
    "name": "country",
    "connectedmodule": [
      "state"
    ],
    "relations": [
      {
        "module": "state",
        "localField": "_id",
        "foreignField": "countryid"
      }
    ]
  },
  {
    "name": "departments",
    "connectedmodule": []
  },
  {
    "name": "customers",
    "connectedmodule": [
      "sale",
      "cart",
      "orders"
    ],
    "relations": [
      {
        "module": "sale",
        "localField": "_id",
        "foreignField": "customerid"
      },
      {
        "module": "cart",
        "localField": "_id",
        "foreignField": "customerid"
      },
      {
        "module": "orders",
        "localField": "_id",
        "foreignField": "customerid"
      }
    ]
  },
  {
    "name": "customercategory",
    "connectedmodule": []
  },
  {
    "name": "designmaster",
    "connectedmodule": [
      "catelogue"
    ],
    "relations": [
      {
        "module": "catelogue",
        "localField": "_id",
        "foreignField": "designmasterid"
      }
    ]
  },
  {
    "name": "diamondclarity",
    "connectedmodule": []
  },
  {
    "name": "diamondcolor",
    "connectedmodule": []
  },
  {
    "name": "diamondcut",
    "connectedmodule": []
  },
  {
    "name": "diamondentry",
    "connectedmodule": []
  },
  {
    "name": "activities",
    "connectedmodule": []
  },
  {
    "name": "diamonds",
    "connectedmodule": []
  },
  {
    "name": "diamondshape",
    "connectedmodule": []
  },
  {
    "name": "diamondsize",
    "connectedmodule": []
  },
  {
    "name": "entrypreference",
    "connectedmodule": []
  },
  {
    "name": "goldtransection",
    "connectedmodule": [
      "branches",
      "account",
      "salesman"
    ],
    "relations": [
      {
        "module": "branches",
        "localField": "branchid",
        "foreignField": "_id"
      },
      {
        "module": "account",
        "localField": "accountid",
        "foreignField": "_id"
      },
      {
        "module": "salesman",
        "localField": "salesmanid",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "estimates",
    "connectedmodule": []
  },
  {
    "name": "diamondtype",
    "connectedmodule": []
  },
  {
    "name": "helper",
    "connectedmodule": [
      "branches",
      "salesman",
      "counter",
      "orders"
    ],
    "relations": [
      {
        "module": "branches",
        "localField": "branchid",
        "foreignField": "_id"
      },
      {
        "module": "salesman",
        "localField": "salespersonid",
        "foreignField": "_id"
      },
      {
        "module": "orders",
        "localField": "_id",
        "foreignField": "helperid"
      }
    ]
  },
  {
    "name": "hsn",
    "connectedmodule": [
      "itemgroup"
    ],
    "relations": [
      {
        "module": "itemgroup",
        "localField": "_id",
        "foreignField": "hsn"
      }
    ]
  },
  {
    "name": "inventory",
    "connectedmodule": [
      "category",
      "color",
      "counter",
      "itemlist",
      "variety",
      "subvariety",
      "shape",
      "type",
      "subcategory",
      "style",
      "ledger"
    ],
    "relations": [
      {
        "module": "itemlist",
        "localField": "itemlistid",
        "foreignField": "_id"
      },
      {
        "module": "color",
        "localField": "color",
        "foreignField": "_id"
      },
      {
        "module": "counter",
        "localField": "counter",
        "foreignField": "_id"
      },
      {
        "module": "category",
        "localField": "category",
        "foreignField": "_id"
      },
      {
        "module": "variety",
        "localField": "variety",
        "foreignField": "_id"
      },
      {
        "module": "subvariety",
        "localField": "subvariety",
        "foreignField": "_id"
      },
      {
        "module": "shape",
        "localField": "shape",
        "foreignField": "_id"
      },
      {
        "module": "type",
        "localField": "type",
        "foreignField": "_id"
      },
      {
        "module": "subcategory",
        "localField": "subcategory",
        "foreignField": "_id"
      },
      {
        "module": "ledger",
        "localField": "_id",
        "foreignField": "inventoryid"
      }
    ]
  },
  {
    "name": "amm",
    "connectedmodule": []
  },
  {
    "name": "itemlist",
    "connectedmodule": [
      "category",
      "itemgroup",
      "inventory",
      "ledger"
    ],
    "relations": [
      {
        "module": "category",
        "localField": "category",
        "foreignField": "_id"
      },
      {
        "module": "itemgroup",
        "localField": "_id",
        "foreignField": "itemlist"
      },
      {
        "module": "inventory",
        "localField": "_id",
        "foreignField": "itemlistid"
      },
      {
        "module": "ledger",
        "localField": "_id",
        "foreignField": "itemlistid"
      }
    ]
  },
  {
    "name": "itemgroup",
    "connectedmodule": [
      "itemlist",
      "metal",
      "itemmaster",
      "unit",
      "hsn",
      "itemtype"
    ],
    "relations": [
      {
        "module": "itemlist",
        "localField": "itemlist",
        "foreignField": "_id"
      },
      {
        "module": "metal",
        "localField": "metal",
        "foreignField": "_id"
      },
      {
        "module": "itemmaster",
        "localField": "itemmaster",
        "foreignField": "_id"
      },
      {
        "module": "unit",
        "localField": "unit",
        "foreignField": "_id"
      },
      {
        "module": "hsn",
        "localField": "hsn",
        "foreignField": "_id"
      },
      {
        "module": "itemtype",
        "localField": "itemtype",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "itemmaster",
    "connectedmodule": [
      "itemgroup",
      "ledger"
    ],
    "relations": [
      {
        "module": "itemgroup",
        "localField": "_id",
        "foreignField": "itemmaster"
      },
      {
        "module": "ledger",
        "localField": "_id",
        "foreignField": "itemmasterid"
      }
    ]
  },
  {
    "name": "itemtype",
    "connectedmodule": [
      "itemgroup"
    ],
    "relations": [
      {
        "module": "itemgroup",
        "localField": "_id",
        "foreignField": "itemtype"
      }
    ]
  },
  {
    "name": "mainmenu",
    "connectedmodule": []
  },
  {
    "name": "ledger",
    "connectedmodule": [
      "branches",
      "account",
      "salesman",
      "itemlist",
      "inventory",
      "itemmaster"
    ],
    "relations": [
      {
        "module": "branches",
        "localField": "branchid",
        "foreignField": "_id"
      },
      {
        "module": "account",
        "localField": "accountid",
        "foreignField": "_id"
      },
      {
        "module": "salesman",
        "localField": "salesmanid",
        "foreignField": "_id"
      },
      {
        "module": "itemlist",
        "localField": "itemlistid",
        "foreignField": "_id"
      },
      {
        "module": "inventory",
        "localField": "inventoryid",
        "foreignField": "_id"
      },
      {
        "module": "itemmaster",
        "localField": "itemmasterid",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "metal",
    "connectedmodule": [
      "itemgroup"
    ],
    "relations": [
      {
        "module": "itemgroup",
        "localField": "_id",
        "foreignField": "metal"
      }
    ]
  },
  {
    "name": "notifications",
    "connectedmodule": []
  },
  {
    "name": "notify",
    "connectedmodule": []
  },
  {
    "name": "ammratecut",
    "connectedmodule": []
  },
  {
    "name": "occupation",
    "connectedmodule": [
      "account"
    ],
    "relations": [
      {
        "module": "account",
        "localField": "_id",
        "foreignField": "occupation"
      }
    ]
  },
  {
    "name": "orderdiamonds",
    "connectedmodule": []
  },
  {
    "name": "orders",
    "connectedmodule": [
      "salesman",
      "helper",
      "customers",
      "attempts"
    ],
    "relations": [
      {
        "module": "salesman",
        "localField": "salespersonid",
        "foreignField": "_id"
      },
      {
        "module": "helper",
        "localField": "helperid",
        "foreignField": "_id"
      },
      {
        "module": "customers",
        "localField": "customerid",
        "foreignField": "_id"
      },
      {
        "module": "attempts",
        "localField": "attemptid",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "outstanding",
    "connectedmodule": []
  },
  {
    "name": "permissions",
    "connectedmodule": []
  },
  {
    "name": "pmmchallan",
    "connectedmodule": []
  },
  {
    "name": "ordercolors",
    "connectedmodule": []
  },
  {
    "name": "orderitem",
    "connectedmodule": []
  },
  {
    "name": "roles",
    "connectedmodule": []
  },
  {
    "name": "purchasetransection",
    "connectedmodule": []
  },
  {
    "name": "qc",
    "connectedmodule": []
  },
  {
    "name": "prasangs",
    "connectedmodule": [
      "saletransection"
    ],
    "relations": [
      {
        "module": "saletransection",
        "localField": "_id",
        "foreignField": "prasangid"
      }
    ]
  },
  {
    "name": "amtagainst",
    "connectedmodule": []
  },
  {
    "name": "ratefixtransection",
    "connectedmodule": [
      "branches",
      "account",
      "salesman"
    ],
    "relations": [
      {
        "module": "branches",
        "localField": "branchid",
        "foreignField": "_id"
      },
      {
        "module": "account",
        "localField": "accountid",
        "foreignField": "_id"
      },
      {
        "module": "salesman",
        "localField": "salesmanid",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "pricemaster",
    "connectedmodule": []
  },
  {
    "name": "productpmm",
    "connectedmodule": []
  },
  {
    "name": "products",
    "connectedmodule": []
  },
  {
    "name": "approvalstatus",
    "connectedmodule": []
  },
  {
    "name": "salesman",
    "connectedmodule": [
      "saletransection",
      "salereturntransection",
      "banktransection",
      "cashtransection",
      "ratefixtransection",
      "goldtransection",
      "approvaltransection",
      "helper",
      "ledger",
      "orders"
    ],
    "relations": [
      {
        "module": "saletransection",
        "localField": "_id",
        "foreignField": "salesmanid"
      },
      {
        "module": "salereturntransection",
        "localField": "_id",
        "foreignField": "salesmanid"
      },
      {
        "module": "banktransection",
        "localField": "_id",
        "foreignField": "salesmanid"
      },
      {
        "module": "cashtransection",
        "localField": "_id",
        "foreignField": "salesmanid"
      },
      {
        "module": "ratefixtransection",
        "localField": "_id",
        "foreignField": "salesmanid"
      },
      {
        "module": "goldtransection",
        "localField": "_id",
        "foreignField": "salesmanid"
      },
      {
        "module": "approvaltransection",
        "localField": "_id",
        "foreignField": "salesmanid"
      },
      {
        "module": "helper",
        "localField": "_id",
        "foreignField": "salespersonid"
      },
      {
        "module": "ledger",
        "localField": "_id",
        "foreignField": "salesmanid"
      },
      {
        "module": "orders",
        "localField": "_id",
        "foreignField": "salespersonid"
      }
    ]
  },
  {
    "name": "sale",
    "connectedmodule": [
      "attempts",
      "customers"
    ],
    "relations": [
      {
        "module": "attempts",
        "localField": "attemptid",
        "foreignField": "_id"
      },
      {
        "module": "customers",
        "localField": "customerid",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "salereturntransection",
    "connectedmodule": [
      "branches",
      "account",
      "salesman",
      "saletransection",
      "inventory",
      "itemlist"
    ],
    "relations": [
      {
        "module": "branches",
        "localField": "branchid",
        "foreignField": "_id"
      },
      {
        "module": "account",
        "localField": "accountid",
        "foreignField": "_id"
      },
      {
        "module": "salesman",
        "localField": "salesmanid",
        "foreignField": "_id"
      },
      {
        "module": "saletransection",
        "localField": "saletransectionid",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "saletransection",
    "connectedmodule": [
      "branches",
      "account",
      "salesman",
      "prasangs",
      "inventory",
      "itemlist"
    ],
    "relations": [
      {
        "module": "branches",
        "localField": "branchid",
        "foreignField": "_id"
      },
      {
        "module": "account",
        "localField": "accountid",
        "foreignField": "_id"
      },
      {
        "module": "salesman",
        "localField": "salesmanid",
        "foreignField": "_id"
      },
      {
        "module": "prasangs",
        "localField": "prasangid",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "status",
    "connectedmodule": []
  },
  {
    "name": "styles",
    "connectedmodule": []
  },
  {
    "name": "shape",
    "connectedmodule": [
      "inventory"
    ],
    "relations": [
      {
        "module": "inventory",
        "localField": "_id",
        "foreignField": "shape"
      }
    ]
  },
  {
    "name": "state",
    "connectedmodule": [
      "country",
      "area"
    ],
    "relations": [
      {
        "module": "country",
        "localField": "countryid",
        "foreignField": "_id"
      },
      {
        "module": "area",
        "localField": "_id",
        "foreignField": "stateid"
      }
    ]
  },
  {
    "name": "size",
    "connectedmodule": []
  },
  {
    "name": "styletype",
    "connectedmodule": []
  },
  {
    "name": "substatus",
    "connectedmodule": []
  },
  {
    "name": "subvariety",
    "connectedmodule": [
      "inventory"
    ],
    "relations": [
      {
        "module": "inventory",
        "localField": "_id",
        "foreignField": "subvariety"
      }
    ]
  },
  {
    "name": "supplierchitthi",
    "connectedmodule": []
  },
  {
    "name": "subcategory",
    "connectedmodule": [
      "inventory"
    ],
    "relations": [
      {
        "module": "inventory",
        "localField": "_id",
        "foreignField": "subcategory"
      }
    ]
  },
  {
    "name": "suppliergroup",
    "connectedmodule": []
  },
  {
    "name": "approvaltransection",
    "connectedmodule": [
      "branches",
      "account",
      "salesman"
    ],
    "relations": [
      {
        "module": "branches",
        "localField": "branchid",
        "foreignField": "_id"
      },
      {
        "module": "account",
        "localField": "accountid",
        "foreignField": "_id"
      },
      {
        "module": "salesman",
        "localField": "salesmanid",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "supplierstyles",
    "connectedmodule": []
  },
  {
    "name": "suppliervoucheritem",
    "connectedmodule": []
  },
  {
    "name": "suppliers",
    "connectedmodule": []
  },
  {
    "name": "suppliervoucher",
    "connectedmodule": []
  },
  {
    "name": "type",
    "connectedmodule": [
      "inventory"
    ],
    "relations": [
      {
        "module": "inventory",
        "localField": "_id",
        "foreignField": "type"
      }
    ]
  },
  {
    "name": "users",
    "connectedmodule": []
  },
  {
    "name": "unit",
    "connectedmodule": [
      "itemgroup"
    ],
    "relations": [
      {
        "module": "itemgroup",
        "localField": "_id",
        "foreignField": "unit"
      }
    ]
  },
  {
    "name": "area",
    "connectedmodule": [
      "city",
      "state"
    ],
    "relations": [
      {
        "module": "city",
        "localField": "cityid",
        "foreignField": "_id"
      },
      {
        "module": "state",
        "localField": "stateid",
        "foreignField": "_id"
      }
    ]
  },
  {
    "name": "variety",
    "connectedmodule": [
      "inventory"
    ],
    "relations": [
      {
        "module": "inventory",
        "localField": "_id",
        "foreignField": "variety"
      }
    ]
  },
  {
    "name": "wishlist",
    "connectedmodule": [
      "cart"
    ],
    "relations": [
      {
        "module": "cart",
        "localField": "_id",
        "foreignField": "wishlistid"
      }
    ]
  }
]

async function updateConnectedModules() {
  try {
    for (const item of modules111) {
      const result = await ModuleField.updateOne(
        { module: item.name },
        {
          $set: {
            connectedmodule: item.connectedmodule,
            relations: item.relations || []
          }
        }
      );

      console.log(
        `Updated ${item.name} -> matched:${result.matchedCount} modified:${result.modifiedCount}`
      );
    }

    console.log('Completed');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

updateConnectedModules();
