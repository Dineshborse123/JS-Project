const steps = document.querySelectorAll(".step");
function showStep(i) {
  steps.forEach((s, idx) => s.classList.toggle("active", idx === i));
}

let journey = {};
const trains = [
  {name: "Rajdhani Express", time: "08:00 AM", fares: {SL:400, "3A":850, "2A":1200, "1A":2000}},
  {name: "Shatabdi Express", time: "10:30 AM", fares: {SL:300, "3A":700, "2A":1000, "1A":1800}},
  {name: "Duronto Express", time: "07:15 PM", fares: {SL:350, "3A":800, "2A":1100, "1A":1900}}
];

// Step 1 → search
document.getElementById("trainForm").addEventListener("submit", e => {
  e.preventDefault();
  journey.from = document.getElementById("from").value;
  journey.to = document.getElementById("to").value;
  journey.date = document.getElementById("date").value;
  journey.quota = document.getElementById("quota").value;

  const cards = document.getElementById("trainCards");
  cards.innerHTML = "";
  trains.forEach(t => {
    const div = document.createElement("div");
    div.classList.add("train-card");
    div.innerHTML = `<div><b>${t.name}</b> - ${t.time}</div>
      <div class="class-buttons">
        ${Object.entries(t.fares).map(([cls, price]) =>
          `<button data-train="${t.name}" data-class="${cls}" data-fare="${price}">${cls} - ₹${price}</button>`
        ).join("")}
      </div>`;
    cards.appendChild(div);
  });
  showStep(1);
});

// Train class selection
document.getElementById("trainCards").addEventListener("click", e => {
  if(e.target.tagName==="BUTTON"){
    journey.train = e.target.dataset.train;
    journey.class = e.target.dataset.class;
    journey.fare = e.target.dataset.fare;
    showStep(2);
  }
});

// Add passenger
document.getElementById("addPassenger").addEventListener("click", () => {
  const div = document.createElement("div");
  div.classList.add("passenger");
  div.innerHTML = `
    <input type="text" placeholder="Passenger Name" required>
    <input type="number" placeholder="Age" min="1" required>
    <select required>
      <option value="">Gender</option>
      <option>Male</option>
      <option>Female</option>
      <option>Other</option>
    </select>
    <select required>
      <option value="">Berth</option>
      <option>Lower</option>
      <option>Middle</option>
      <option>Upper</option>
      <option>Side Lower</option>
      <option>Side Upper</option>
    </select>`;
  document.getElementById("passengers").appendChild(div);
});

// Passenger form
document.getElementById("passengerForm").addEventListener("submit", e => {
  e.preventDefault();
  document.getElementById("reviewTrain").innerText = journey.train;
  document.getElementById("reviewFrom").innerText = journey.from;
  document.getElementById("reviewTo").innerText = journey.to;
  document.getElementById("reviewDate").innerText = journey.date;
  document.getElementById("reviewQuota").innerText = journey.quota;
  document.getElementById("reviewClass").innerText = journey.class;
  document.getElementById("reviewFare").innerText = journey.fare;
  showStep(3);
});

// Review → Payment
document.getElementById("proceedPayment").addEventListener("click", () => showStep(4));

// Payment
document.getElementById("paymentForm").addEventListener("submit", e => {
  e.preventDefault();
  if(document.getElementById("card").value.length!==15 || document.getElementById("cvv").value.length!==3){
    alert("Invalid Card/CVV"); return;
  }
  const pnr = Math.floor(1000000000 + Math.random()*9000000000);
  document.getElementById("pnr").innerText = pnr;
  document.getElementById("ticketTrain").innerText = journey.train;
  document.getElementById("ticketFrom").innerText = journey.from;
  document.getElementById("ticketTo").innerText = journey.to;
  document.getElementById("ticketDate").innerText = journey.date;
  document.getElementById("ticketQuota").innerText = journey.quota;
  document.getElementById("ticketClass").innerText = journey.class;
  document.getElementById("ticketFare").innerText = journey.fare;
  showStep(5);
});

// New Booking
document.getElementById("newBooking").addEventListener("click", () => location.reload());

// Back buttons
document.getElementById("backToSearch").addEventListener("click", () => showStep(0));
document.getElementById("backToTrains").addEventListener("click", () => showStep(1));
document.getElementById("backToPassengers").addEventListener("click", () => showStep(2));
document.getElementById("backToReview").addEventListener("click", () => showStep(3));

// Start
showStep(0);
