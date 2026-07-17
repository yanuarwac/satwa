async function getAnimal() {
    const animal = document
        .getElementById("animalName")
        .value
        .trim()
        .toLowerCase();

    if (!animal) {
        alert("Masukkan nama hewan.");
        return;
    }

    const resultBox = document.getElementById("result");
    resultBox.innerHTML = "Loading...";

    try {
        const apiBase = '';
        const response = await fetch(`${apiBase}/api/animal?name=${encodeURIComponent(animal)}`);

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            const message = errorData?.error || "Gagal mengambil data dari server";
            throw new Error(message);
        }

        const data = await response.json();
        const item = Array.isArray(data) ? data[0] : data;

        if (!item) {
            resultBox.innerHTML = "<h3>Data tidak ditemukan.</h3>";
            return;
        }

        resultBox.innerHTML = `
            <h2>${item.name || "Tidak diketahui"}</h2>
            <b>Scientific Name :</b> ${item.taxonomy?.scientific_name || "-"}</p>
            <b>Kingdom :</b> ${item.taxonomy?.kingdom || "-"}</p>
            <b>Family :</b> ${item.taxonomy?.family || "-"}</p>
            <b>Habitat :</b> ${item.characteristics?.habitat || "-"}</p>
            <b>Diet :</b> ${item.characteristics?.diet || "-"}</p>
            <b>Lifespan :</b> ${item.characteristics?.lifespan || "-"}</p>
            <b>Weight :</b> ${item.characteristics?.weight || "-"}</p>
            <b>Top Speed :</b> ${item.characteristics?.top_speed || "-"}</p>
        `;
    } catch (error) {
        resultBox.innerHTML = `<p style="color:red">${error.message}</p>`;
        console.error(error);
    }
}

// Trigger search when Enter key is pressed
document.getElementById("animalName").addEventListener("keydown", function(event) {
    if (event.key === "Enter") {
        getAnimal();
    }
});

