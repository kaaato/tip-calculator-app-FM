const form = document.querySelector(".form");
const billInput = document.querySelector("#bill");
const billErrorMessageSpan = document.querySelector("#bill + .box--input-error-message");
const firstRadio = document.querySelector("#tip-1");
const secondLastRadio = document.querySelector("#tip-5");
const lastRadio = document.querySelector("input[value='custom']");
const customInput = document.querySelector(".custom");
const fieldsetErrorMessageDiv = document.querySelector(".fieldset-error-message");
const numberOfPeopleErrorMessageSpan = document.querySelector("#number-of-people + .box--input-error-message");
const result1 = document.querySelector(".text-tip-2");
const result2 = document.querySelector(".text-total-2");
const resetButton = document.querySelector(".button-reset");
const summaryDiv = document.querySelector(".aria-live--summary");
let bill, tip, customValue, numberOfPeople;

makeNavigationOrderByKeyboard();
mainFeatures();
resetFeatures();

function makeNavigationOrderByKeyboard() {
  firstRadio.addEventListener("focus", function (event) {
    if (!this.checked) this.checked = true;
  })
  
  lastRadio.addEventListener("focus", function (event) {
    if(!this.checked) this.checked = true;
    customInput.focus();
  })
  
  customInput.addEventListener("keydown", function (event) {
    let isCustomTip = new FormData(form).get("tip") == "custom";
    if (isCustomTip && (event.code == "ArrowLeft")) {
      secondLastRadio.checked = true;
      secondLastRadio.focus();
    } else if (isCustomTip && (event.code == "ArrowRight")) {
      firstRadio.checked = true;
      firstRadio.focus();
    } else if (isCustomTip && (event.shiftKey && event.code == "Tab")) {
      event.preventDefault();
      billInput.focus();
    }
  })
  
  billInput.addEventListener("keydown", function (event) {
    let isCustomTip = new FormData(form).get("tip") == "custom";
    if (isCustomTip && (event.code == "Tab")) {
      event.preventDefault();
      customInput.focus();
    }
  })
}

function mainFeatures() {
  form.addEventListener("input", function () { // on any input
    let errorMessages = validateInputs();
    updateDoms(errorMessages);
  })

  // due to the makeNavigationOrderByKeyboard function above some of the inputs don't trigger input events. The following event listeners are to catch up with that issue.
  firstRadio.addEventListener("focus", function () { // on the first radio
    let errorMessages = validateInputs();
    updateDoms(errorMessages);
  })

  lastRadio.addEventListener("focus", function () { // on the custom input
    let errorMessages = validateInputs();
    updateDoms(errorMessages);
  })

  customInput.addEventListener("keydown", function (event) { // on the 50% tip radio
    if (event.code == "ArrowLeft") {
      let errorMessages = validateInputs();
      updateDoms(errorMessages);
    }
  })

  function updateDoms(errorMessages) {
    let [billErrorMessage, tipErrorMessage, numberOfPeopleErrorMessage] = errorMessages;

    changeErrorMessageAndState(billErrorMessage, billErrorMessageSpan);
    changeErrorMessageAndState(tipErrorMessage, fieldsetErrorMessageDiv);
    changeErrorMessageAndState(numberOfPeopleErrorMessage, numberOfPeopleErrorMessageSpan);

    let isAllValid = errorMessages.filter(message => message).length <= 0;

    if (isAllValid) {
      let outputInArray = calculateTipAndTotal(bill, tip, customValue, numberOfPeople);
      result1.textContent = outputInArray[0];
      result2.textContent = outputInArray[1];
      summaryDiv.textContent = `Tip amount per person is $${outputInArray[0]}. Total per person is $${outputInArray[1]}.`;
      resetButton.classList.add("allValid");
    } else { 
      result1.textContent = "0.00";
      result2.textContent = "0.00";
      resetButton.classList.remove("allValid");
    }

    function calculateTipAndTotal(bill, tip, customValue, numberOfPeople) {
      let tipDecided = Number(tip) ? tip : customValue;
      let tipPerPerson = (Number(bill) * (Number(tipDecided) / 100) / Number(numberOfPeople)).toFixed(2);
      let totalPerPerson = (Number(bill) * (Number(tipDecided) / 100 + 1) / Number(numberOfPeople)).toFixed(2);
      return [tipPerPerson, totalPerPerson];
    }

    function changeErrorMessageAndState(errorMessage, element) {
      if (errorMessage) {
        element.classList.add("invalid");
      } else {
        element.classList.remove("invalid");
      }
      element.textContent = errorMessage;
    }
  }

  function validateInputs() {
    ({ bill, tip, customValue, numberOfPeople } = Object.fromEntries(new FormData(form)));
    let billErrorMessage = validateBill(bill);
    let tipErrorMessage = validateTip(tip, customValue);
    let numberOfPeopleErrorMessage = validateNumberOfPeople(numberOfPeople);
    return [billErrorMessage, tipErrorMessage, numberOfPeopleErrorMessage];

    function validateBill(bill) {
      if (bill == "") return "Enter your bill";
      if (Number(bill) == 0) return "Can't be zero";
      if (!Number(bill)) return "Must be a number";
      return "";
    }

    function validateTip(tip, customValue) {
      if (!tip) return "Pick a tip";
      if (tip == "custom" && (customValue == "")) return "Enter your tip";
      if (tip == "custom" && (Number(customValue) == 0)) return "Can't be zero";
      if (tip == "custom" && (!Number.isInteger(Number(customValue)))) return "Must be a whole number";
      return "";
    }

    function validateNumberOfPeople(numberOfPeople) {
      if (numberOfPeople == "") return "Enter a number";
      if (Number(numberOfPeople) == 0) return "Can't be zero";
      if (!Number.isInteger(Number(numberOfPeople))) return "Must be a whole number";
      return "";
    }
  }
}

function resetFeatures() {
  resetButton.addEventListener("click", function () {
    let invalidClasses = document.querySelectorAll(".invalid");
    if (0 < invalidClasses.length) {
      for (let element of invalidClasses) {
        element.classList.remove("invalid");
        element.textContent = "";
      }
    }
    result1.textContent = "0.00";
    result2.textContent = "0.00";
    summaryDiv.textContent = `Tip amount per person is $0.00. Total per person is $0.00.`
  })
}