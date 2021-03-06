//--------------
//budget controller
//--------------
var BudgetController = (function() {
  //define Expenses constructor
  var Expenses = function(id, value, description) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  //during each inseration process, make calculate  (income value / total income)
  //look up to calculatePercentages
  Expenses.prototype.calculatePercentage = function(totalIncome) {
    if (totalIncome > 0) {
      this.percentage = Math.round((this.value / totalIncome) * 100);
    } else {
      this.percentage = -1;
    }
  };

  //define income constructor
  var Income = function(id, value, description) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;
    data.allItems[type].forEach(function(current) {
      sum = sum + current.value;
    });
    data.total[type] = sum;
  };

  var data = {
    allItems: {
      inc: [],
      exp: []
    },
    total: {
      inc: 0,
      exp: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    //insert json data(object) to data all item
    addItem: function(type, value, desc) {
      var newItem, ID;

      //define ID
      //if its first entry set ID to be 0, other wise increase 1 to last save ID
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      if (type === "inc") {
        newItem = new Income(ID, value, desc);
      } else if (type === "exp") {
        newItem = new Expenses(ID, value, desc);
      }

      //save to data array
      data.allItems[type].push(newItem);
      return newItem;
    },

    calculateBudget: function() {
      //calculate total income & expenses
      calculateTotal("exp");
      calculateTotal("inc");

      //calculate the buedget : income - expenses
      data.budget = data.total.inc - data.total.exp;

      //calculate the percentage
      if (data.total.inc > 0) {
        data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        percentage: data.percentage
      };
    },

    removeItem: function(type, id) {
      var ids, index;

      ids = data.allItems[type].map(function(current) {
        return current.id;
      });

      index = ids.indexOf(id);

      //index will give -1 incase id not existign
      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    //loop throw all items -> exp array
    //the resualt from (calculatePercentage) will asign to allitems->exp array by below process
    calculatePercentages: function() {
      data.allItems.exp.forEach(function(current) {
        current.calculatePercentage(data.total.inc);
      });
    },

    //loop thorw all items -> exp array
    //return new map contain only percentages
    getPercentages: function() {
      var allPerc = data.allItems.exp.map(function(current) {
        return current.percentage;
      });
      return allPerc;
    },

    testing: function() {
      console.log(data);
    }
  };
})();

//--------------
//ui controller
//--------------
var UIController = (function() {
  //define all UI controller => BTN, Html list, inputs...etc
  var DOMString = {
    inputType: ".add__type",
    inputValue: ".add__value",
    inputDesc: ".add__description",
    addBtn: ".add__btn",
    incomeList: ".income__list",
    expensesList: ".expenses__list",
    budget: ".budget__value",
    budgetIncome: ".budget__income--value",
    budgetExpenses: ".budget__expenses--value",
    budgetPercentage: ".budget__expenses--percentage",
    container: ".container",
    percentageItemLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  
  var formatNumber = function(num, type){
      //2130.09 -> +2,310.46
      //2000 -> +2,000
      var numSplit, int, dec, type, sign;

      num = Math.abs(num);
      num = num.toFixed(2);

      numSplit = num.split('.');
      int = numSplit[0];
      dec = numSplit[1];

      if(int.length > 3){
          //23510 -> 23,510
          int = int.substr(0, int.length - 3) +','+ int.substr(int.length - 3, 3);
      }

      return (type === 'exp' ? sign = '-' : sign = '+') + ' ' + int + '.' + dec;
  }

        //use first class citizen
    //create function like foreach, for node list
    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i)
        }
    }

  //return global values & function
  return {
    getIputs: function() {
      //catch budget input
      return {
        type: document.querySelector(DOMString.inputType).value,
        desc: document.querySelector(DOMString.inputDesc).value,
        value: parseFloat(document.querySelector(DOMString.inputValue).value)
      };
    },

    //return DOMString to be global
    getDoms: function() {
      return DOMString;
    },

    displayMonth: function(){
        var now, month, months, year;

        months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        now = new Date();
        month = now.getMonth();
        year = now.getFullYear();
        document.querySelector(DOMString.dateLabel).textContent = months[month] +' '+ year;
    },

    //add new entry to HTML list
    addToHtmlList: function(type, obj) {
      var html, newHtml, listType;
      if (type === "inc") {
        listType = DOMString.incomeList;

        html =
          '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === "exp") {
        listType = DOMString.expensesList;

        html =
          '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //replace
      newHtml = html.replace("%id%", obj.id);
      newHtml = newHtml.replace("%desc%", obj.description);
      newHtml = newHtml.replace("%value%", formatNumber(obj.value, type));

      //insert into list
      document
        .querySelector(listType)
        .insertAdjacentHTML("beforebegin", newHtml);
    },

    removeFromHtmlList: function(itemID) {
      document
        .getElementById(itemID)
        .parentNode.removeChild(document.getElementById(itemID));
    },

    //clear fields after enter value
    clearFiled: function() {
      var fields, arrayfields;

      fields = document.querySelectorAll(
        DOMString.inputDesc + ", " + DOMString.inputValue
      );
      //convert from nideList to array
      arrayfields = Array.prototype.slice.call(fields);
      //or
      //arrayfields = [...fields];

      //loop throw fields and clear values
      arrayfields.forEach(function(current, value, array) {
        current.value = "";
      });
      //focus in desc field
      arrayfields[0].focus();
    },

    displayBudget: function(obj) {
        var type;
        obj.budget > 0 ? type = 'inc' : type = 'exp';
        document.querySelector(DOMString.budget).textContent = formatNumber(obj.budget, type);
        document.querySelector(DOMString.budgetIncome).textContent =  formatNumber(obj.totalInc, type);
        document.querySelector(DOMString.budgetExpenses).textContent = formatNumber(obj.totalExp, type);
        if (obj.percentage > 0) {
            document.querySelector(DOMString.budgetPercentage).textContent = obj.percentage + "%";
        } else {
            document.querySelector(DOMString.budgetPercentage).textContent = "---";
        }
    },

    displayItemPercentage: function(percentages){
        var percentageItems = document.querySelectorAll(DOMString.percentageItemLabel);

        nodeListForEach(percentageItems, function(current, index){
            if(percentages[index] > 0){
                current.textContent = percentages[index] + '%';
            }else{
                current.textContent = '---';
            }
        })

        //or
        // var convertArray = Array.prototype.slice.call(percentageItems);
        // convertArray.forEach(function(current, index){
        //     if(percentages[index] > 0){
        //         current.textContent = percentages[index] + '%';
        //     }else{
        //         current.textContent = '---';
        //     }
        // });
    },

    changeInputsColor: function(){
        var fields;

        fields = document.querySelectorAll(
            DOMString.inputType + ',' +
            DOMString.inputDesc + ',' +
            DOMString.inputValue
        );

        nodeListForEach(fields, function(current){
            current.classList.toggle('red-focus');
        });

        document.querySelector(DOMString.addBtn).classList.toggle('red');
    }
  };
})();

//--------------
//global controller
//call UI & budget controller
//init app
//--------------
var GlobalController = (function(budgetCtrl, UICtrl) {
  //event listener func
  var setupEventListener = function() {
    var domString = UICtrl.getDoms();

    //fire addItem function once insert BTN clicked
    document.querySelector(domString.addBtn).addEventListener("click", addItemCtrl);

    //fire addItem function once enter BTN clicked
    document.addEventListener("keypress", function(event) {
      if (event.keyCode === 13 || event.which === 13) {
        addItemCtrl();
      }
    });

    //fire removeItemCtrl by event delegation
    document.querySelector(domString.container).addEventListener("click", removeItemCtrl);

    document.querySelector(domString.inputType).addEventListener('change', UICtrl.changeInputsColor);
  };

  var updateBudget = function() {
    //calculate Budget
    budgetCtrl.calculateBudget();

    //return total budget
    var budget = budgetCtrl.getBudget();

    //pass budget info to ui display
    UICtrl.displayBudget(budget);
  };

  var updatePercentages = function() {

    budgetCtrl.calculatePercentages();

    var getPercentages = budgetCtrl.getPercentages();

    UICtrl.displayItemPercentage(getPercentages);
  };

  var addItemCtrl = function() {
    var input, newItem;
    //read all inputs
    input = UICtrl.getIputs();

    if (input.desc !== "" && !isNaN(input.value) && input.value > 0) {
      //insert as object
      newItem = budgetCtrl.addItem(input.type, input.value, input.desc);

      //insert to html list
      UICtrl.addToHtmlList(input.type, newItem);

      //clear fields
      UICtrl.clearFiled();

      //calcualte and update budget
      updateBudget();

      //calcualte and update percentages
      updatePercentages();
    }
  };

  var removeItemCtrl = function(event) {
    var itemID, splitID, ID, type;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      //remove item from data array in budget controller
      budgetCtrl.removeItem(type, ID);

      //remove from HTML list
      UICtrl.removeFromHtmlList(itemID);

      //re-calcualte and update budget
      updateBudget();

      //calcualte and update percentages
      updatePercentages();
    }
  };

  return {
    init: function() {
      setupEventListener();
      UICtrl.displayMonth();
      UICtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      console.log("Start budget app!");
    }
  };
})(BudgetController, UIController);

//init app
GlobalController.init();
