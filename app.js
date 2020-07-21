/*******************************************************************************/
/***                             Budget Controller                           ***/
/*******************************************************************************/

const BudgetController = (function() {

    // Expense Constructor
    const Expense = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Income Constructor
    const Income = function(id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    // Private Calculate Total Function
    const calculateTotal = function(type) {
        var sum = 0;
        data.allItems[type].forEach(function(item) {
            sum += item.value;
        });
        data.totals[type] = sum;
    };

    // Private Data Object
    const data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    };

    
    // Public Functions
    return {

        // Add Item Function
        addItem: function(type, des, val) {
            let newItem;

            // create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }
            
            // create new item 
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            data.allItems[type].push(newItem);

            return newItem;
        },

        // Delete Item Function
        deleteItem: function(type, id) {
            let ids, index

            ids = data.allItems[type].map(function(item) {
                return item.id;
            });

            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }

        },

        // Calculate Budget Function
        calculateBudget: function() {

            calculateTotal('inc');
            calculateTotal('exp');

            // calculate the budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            // calculate the percentage of income that is spent
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        // Get Budget Object Function
        getBudget: function() {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            }
        },

        // Console Log Data Object
        testing: function() {
            console.log(data);
        }
    };
})();


/*******************************************************************************/
/***                        User Interface Controller                        ***/
/*******************************************************************************/

const UIController = (function() {

    // Private DOM Selectors Object
    const DOMSelectors = {
        inputType: '#add-type',
        inputDescription: '#add-description',
        inputValue: '#add-value',
        inputBtn: '#add-btn',
        incomeContainer: '#income-list',
        expensesContainer: '#expenses-list',
        budgetLabel: '#budget-value',
        incomeLabel: '#budget-income-value',
        expensesLabel: '#budget-expenses-value',
        percentageLabel: '#budget-expenses-percentage',
        listSection: '#list-section'
    };

    // Public Functions
    return {

        // Get Input Function
        getInput: function() {
            return {
                type: document.querySelector(DOMSelectors.inputType).value, // Will be either inc or exp
                description: document.querySelector(DOMSelectors.inputDescription).value,
                value: parseFloat(document.querySelector(DOMSelectors.inputValue).value)
            };
        },

        // Add List Item Function
        addListItem: function(obj, type) {
            let html, element;

            if (type === 'inc') {
                element = DOMSelectors.incomeContainer;
                html = `<tr id="inc-${obj.id}">
                            <td class="text-left">${obj.description}</td>
                            <td>${obj.value}</td>
                            <td class="text-right"><button class="btn btn-dark remove-item-btn">&times;</button></td>
                        </tr>`;
            } else if (type === 'exp') {
                element = DOMSelectors.expensesContainer;
                html = `<tr id="exp-${obj.id}">
                            <td class="text-left">${obj.description}</td>
                            <td>${obj.value}<span id="item-percentage" class="bg-danger p-1 rounded text-white ml-3">${obj.percentage}</span></td>
                            <td class="text-right"><button class="btn btn-dark remove-item-btn">&times;</button></td>
                        </tr>`;
            }

            // insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', html);
        },

        // Delete List Item function
        deleteListItem: function(selectorID) {
            const element = document.getElementById(selectorID);
            element.parentNode.removeChild(element);
        },

        // Clear Input Fields Function
        clearFields: function() {
            document.querySelector(DOMSelectors.inputDescription).value = "";
            document.querySelector(DOMSelectors.inputValue).value = "";
            document.querySelector(DOMSelectors.inputDescription).focus();
        },

        // Display Budget Function
        displayBudget: function(obj) {
            document.querySelector(DOMSelectors.budgetLabel).textContent = obj.budget;
            document.querySelector(DOMSelectors.incomeLabel).textContent = obj.totalInc;
            document.querySelector(DOMSelectors.expensesLabel).textContent = obj.totalExp;

            if (obj.percentage > 0) {
                document.querySelector(DOMSelectors.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMSelectors.percentageLabel).textContent = '---';
            }
        },

        // DOM Selectors Object Getter Function
        getDOMSelectors: function() {
            return DOMSelectors;
        }
    };
})();




/*******************************************************************************/
/***                           Main App Controller                           ***/
/*******************************************************************************/

const App = (function(BudgetController, UIController) {

    // Private Setup Event Listeners Function
    const setupEventListeners = function() {
        const DOM = UIController.getDOMSelectors();
        
        document.querySelector(DOM.inputBtn).addEventListener('click', addItemCtrl);

        document.addEventListener('keypress', function(event) {
            if (event.keyCode === 13) {
                addItemCtrl();
            }
        });

        document.querySelector(DOM.listSection).addEventListener('click', deleteItemCtrl);
    };

    // Private Update Budget Function
    const updateBudget = function() {

        // calculate the budget
        BudgetController.calculateBudget();

        // return the budget
        const budget = BudgetController.getBudget();
        
        // display the budget in the UI
        UIController.displayBudget(budget);
    };

    // Private Add Item Function
    const addItemCtrl = function() {

        // get the field input data
        const input = UIController.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // add the item to the budget controller
            const newItem = BudgetController.addItem(input.type, input.description, input.value);

            // add the item to the UI
            UIController.addListItem(newItem, input.type);

            // clear input fields
            UIController.clearFields();

            // calculate and update budget
            updateBudget();
        }
    };

    // Private Delete Item Function
    const deleteItemCtrl = function(event) {
        let itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.id;

        if (itemID) {

            // inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // delete the data from the data structure
            BudgetController.deleteItem(type, ID);

            // delete item from the UI
            UIController.deleteListItem(itemID);

            // update and show the new budget
            updateBudget();
        }
    };

    // Public Functions
    return {

        // Init Function
        init: function() {
            console.log('Application started');
            UIController.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };
})(BudgetController, UIController);


// Initialize App Controller
App.init();