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

const modules111 = [
  {
    name: 'account',
    connectedmodule: ['branches', 'accountcategory', 'accountsubcategory'],
    relations: [
      {
        module: 'branches',
        localField: 'branchid',
        foreignField: '_id'
      },
      {
        module: 'accountcategory',
        localField: 'accountcategory',
        foreignField: '_id'
      },
      {
        module: 'accountsubcategory',
        localField: 'accountsubcategory',
        foreignField: '_id'
      }
    ]
  },
  {
    name: 'accountcategory',
    connectedmodule: ['accounts', 'accountsubcategory'],
    relations: [
      {
        module: 'accounts',
        localField: 'accountid',
        foreignField: '_id'
      },
      {
        module: 'accountsubcategory',
        localField: 'accountsubcategory',
        foreignField: '_id'
      }
    ]
  },
  {
    name: 'accountsubcategory',
    connectedmodule: ['accountcategory'],
    relations: [
      {
        module: 'accountcategory',
        localField: 'accountcategory',
        foreignField: '_id'
      }
    ]
  },
  {
    name: 'attempts',
    connectedmodule: ['branches', 'accounts']
  },
  {
    name: 'bank',
    connectedmodule: ['branches']
  },
  {
    name: 'banktransection',
    connectedmodule: ['branches']
  },
  {
    name: 'branches',
    connectedmodule: []
  },
  {
    name: 'cart',
    connectedmodule: ['branches']
  },
  {
    name: 'cashtransection',
    connectedmodule: ['branches']
  },
  {
    name: 'category',
    connectedmodule: ['inventory', 'itemlist']
  },
  {
    name: 'catelogue',
    connectedmodule: ['designmaster']
  },
  {
    name: 'city',
    connectedmodule: ['area']
  },
  {
    name: 'color',
    connectedmodule: ['inventory']
  },
  {
    name: 'counter',
    connectedmodule: ['branches', 'inventory']
  },
  {
    name: 'country',
    connectedmodule: ['state']
  },
  {
    name: 'departments',
    connectedmodule: []
  },
  {
    name: 'customers',
    connectedmodule: []
  },
  {
    name: 'customercategory',
    connectedmodule: []
  },
  {
    name: 'designmaster',
    connectedmodule: ['catelogue']
  },
  {
    name: 'diamondclarity',
    connectedmodule: []
  },
  {
    name: 'diamondcolor',
    connectedmodule: []
  },
  {
    name: 'diamondcut',
    connectedmodule: []
  },
  {
    name: 'diamondentry',
    connectedmodule: []
  },
  {
    name: 'activities',
    connectedmodule: []
  },
  {
    name: 'diamonds',
    connectedmodule: []
  },
  {
    name: 'diamondshape',
    connectedmodule: []
  },
  {
    name: 'diamondsize',
    connectedmodule: []
  },
  {
    name: 'entrypreference',
    connectedmodule: []
  },
  {
    name: 'goldtransection',
    connectedmodule: []
  },
  {
    name: 'estimates',
    connectedmodule: []
  },
  {
    name: 'diamondtype',
    connectedmodule: []
  },
  {
    name: 'helper',
    connectedmodule: []
  },
  {
    name: 'hsn',
    connectedmodule: ['itemgroup']
  },
  {
    name: 'inventory',
    connectedmodule: []
  },
  {
    name: 'amm',
    connectedmodule: []
  },
  {
    name: 'itemlist',
    connectedmodule: ['category', 'itemgroup']
  },
  {
    name: 'itemgroup',
    connectedmodule: [
      'itemlist',
      'metal',
      'itemmaster',
      'unit',
      'hsn',
      'itemtype'
    ],
    relations: [
      {
        module: 'itemlist',
        localField: 'itemlist',
        foreignField: '_id'
      },
      {
        module: 'metal',
        localField: 'metal',
        foreignField: '_id'
      },
      {
        module: 'itemmaster',
        localField: 'itemmaster',
        foreignField: '_id'
      },
      {
        module: 'unit',
        localField: 'unit',
        foreignField: '_id'
      },
      {
        module: 'hsn',
        localField: 'hsn',
        foreignField: '_id'
      },
      {
        module: 'itemtype',
        localField: 'itemtype',
        foreignField: '_id'
      }
    ]
  },
  {
    name: 'itemmaster',
    connectedmodule: ['itemgroup']
  },
  {
    name: 'itemtype',
    connectedmodule: ['itemgroup']
  },
  {
    name: 'mainmenu',
    connectedmodule: []
  },
  {
    name: 'ledger',
    connectedmodule: []
  },
  {
    name: 'metal',
    connectedmodule: ['itemgroup']
  },
  {
    name: 'notifications',
    connectedmodule: []
  },
  {
    name: 'notify',
    connectedmodule: []
  },
  {
    name: 'ammratecut',
    connectedmodule: []
  },
  {
    name: 'occupation',
    connectedmodule: []
  },
  {
    name: 'orderdiamonds',
    connectedmodule: []
  },
  {
    name: 'orders',
    connectedmodule: []
  },
  {
    name: 'outstanding',
    connectedmodule: []
  },
  {
    name: 'permissions',
    connectedmodule: []
  },
  {
    name: 'pmmchallan',
    connectedmodule: []
  },
  {
    name: 'ordercolors',
    connectedmodule: []
  },
  {
    name: 'orderitem',
    connectedmodule: []
  },
  {
    name: 'roles',
    connectedmodule: []
  },
  {
    name: 'purchasetransection',
    connectedmodule: []
  },
  {
    name: 'qc',
    connectedmodule: []
  },
  {
    name: 'prasangs',
    connectedmodule: []
  },
  {
    name: 'amtagainst',
    connectedmodule: []
  },
  {
    name: 'ratefixtransection',
    connectedmodule: []
  },
  {
    name: 'pricemaster',
    connectedmodule: []
  },
  {
    name: 'productpmm',
    connectedmodule: []
  },
  {
    name: 'products',
    connectedmodule: []
  },
  {
    name: 'approvalstatus',
    connectedmodule: []
  },
  {
    name: 'salesman',
    connectedmodule: []
  },
  {
    name: 'sale',
    connectedmodule: []
  },
  {
    name: 'salereturntransection',
    connectedmodule: []
  },
  {
    name: 'saletransection',
    connectedmodule: []
  },
  {
    name: 'status',
    connectedmodule: []
  },
  {
    name: 'styles',
    connectedmodule: []
  },
  {
    name: 'shape',
    connectedmodule: []
  },
  {
    name: 'state',
    connectedmodule: []
  },
  {
    name: 'size',
    connectedmodule: []
  },
  {
    name: 'styletype',
    connectedmodule: []
  },
  {
    name: 'substatus',
    connectedmodule: []
  },
  {
    name: 'subvariety',
    connectedmodule: []
  },
  {
    name: 'supplierchitthi',
    connectedmodule: []
  },
  {
    name: 'subcategory',
    connectedmodule: []
  },
  {
    name: 'suppliergroup',
    connectedmodule: []
  },
  {
    name: 'approvaltransection',
    connectedmodule: []
  },
  {
    name: 'supplierstyles',
    connectedmodule: []
  },
  {
    name: 'suppliervoucheritem',
    connectedmodule: []
  },
  {
    name: 'suppliers',
    connectedmodule: []
  },
  {
    name: 'suppliervoucher',
    connectedmodule: []
  },
  {
    name: 'type',
    connectedmodule: []
  },
  {
    name: 'users',
    connectedmodule: []
  },
  {
    name: 'unit',
    connectedmodule: ['itemgroup'],
    relations: [
      {
        module: 'itemgroup',
        localField: '_id',
        foreignField: 'unit'
      }
    ]
  },
  {
    name: 'userdeviceinfo',
    connectedmodule: []
  },
  {
    name: 'usersessions',
    connectedmodule: []
  },
  {
    name: 'area',
    connectedmodule: []
  },
  {
    name: 'variety',
    connectedmodule: []
  },
  {
    name: 'wishlist',
    connectedmodule: []
  }
];

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
