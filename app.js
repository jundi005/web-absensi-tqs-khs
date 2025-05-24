// Fungsi untuk menyimpan data absensi ke Google Spreadsheet
async function simpanAbsensi(data) {
    try {
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbzYOK0qdK0BtcBC4H3GyWsKuALX8nZY1KHZzeenhdyvsNrPqPvS69gjlFZdthZGJ4aO/exec';
        
        const response = await fetch(scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if(result.result === 'success') {
            alert('Data absensi berhasil disimpan!');
            return true;
        } else {
            alert('Gagal menyimpan data: ' + result.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menyimpan data');
        return false;
    }
}

// Fungsi untuk menyimpan jurnal ke Google Spreadsheet
async function simpanJurnal(data) {
    try {
        const scriptUrl = 'https://script.google.com/macros/s/AKfycbzYOK0qdK0BtcBC4H3GyWsKuALX8nZY1KHZzeenhdyvsNrPqPvS69gjlFZdthZGJ4aO/exec';
        
        const response = await fetch(scriptUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        
        if(result.result === 'success') {
            alert('Jurnal berhasil disimpan!');
            return true;
        } else {
            alert('Gagal menyimpan jurnal: ' + result.message);
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat menyimpan jurnal');
        return false;
    }
}

// Fungsi untuk mengambil data laporan dari Google Spreadsheet
async function ambilLaporan(filter) {
    try {
        const scriptUrl = `https://script.google.com/macros/s/AKfycbzYOK0qdK0BtcBC4H3GyWsKuALX8nZY1KHZzeenhdyvsNrPqPvS69gjlFZdthZGJ4aO/exec_LAPORAN?kelas=${filter.kelas}&bulan=${filter.bulan}&tahun=${filter.tahun}`;
        
        const response = await fetch(scriptUrl);
        const data = await response.json();
        
        return data;
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mengambil data laporan');
        return null;
    }
}

// Contoh penggunaan:
document.addEventListener('DOMContentLoaded', function() {
    // Event listener untuk tombol simpan absensi
    document.querySelectorAll('.btn-primary').forEach(btn => {
        if(btn.textContent.includes('Simpan Absensi')) {
            btn.addEventListener('click', async function() {
                const tanggal = document.getElementById('tanggalAbsensi').value;
                const sesi = document.querySelector('.session-tab.active').getAttribute('data-session');
                const kelas = window.location.pathname.includes('tqs') ? 'TQS 05' : 'KHS 01';
                
                const absensiData = [];
                document.querySelectorAll('.absensi-table tbody tr').forEach(row => {
                    const nama = row.cells[1].textContent;
                    const status = row.cells[2].querySelector('select').value;
                    const keterangan = row.cells[3].querySelector('input').value;
                    
                    absensiData.push({
                        nama,
                        status,
                        keterangan
                    });
                });
                
                const data = {
                    tanggal,
                    sesi,
                    kelas,
                    absensi: absensiData
                };
                
                await simpanAbsensi(data);
            });
        }
        
        // Event listener untuk tombol simpan jurnal
        if(btn.textContent.includes('Simpan Jurnal')) {
            btn.addEventListener('click', async function() {
                const tanggal = document.getElementById('tanggalJurnal').value;
                const hari = document.querySelector('.day-tab.active').getAttribute('data-day');
                const catatan = document.querySelector('.catatan-input').value;
                
                const jurnalData = [];
                document.querySelectorAll('.jadwal-item').forEach(item => {
                    const waktu = item.querySelector('.jadwal-waktu').textContent;
                    const materi = item.querySelector('.jadwal-materi').textContent;
                    const status = item.querySelector('.toggle-label input').checked ? 'masuk' : 'tidak_masuk';
                    
                    jurnalData.push({
                        waktu,
                        materi,
                        status
                    });
                });
                
                const data = {
                    tanggal,
                    hari,
                    jurnal: jurnalData,
                    catatan
                };
                
                await simpanJurnal(data);
            });
        }
    });
    
    // Event listener untuk filter laporan
    document.getElementById('kelasFilter').addEventListener('change', async function() {
        const filter = {
            kelas: this.value,
            bulan: document.getElementById('bulanFilter').value
            tahun: document.getElementById('tahunFilter').value
        };
        
        const laporanData = await ambilLaporan(filter);
        
        if(laporanData) {
            // Update tampilan laporan dengan data baru
            updateTampilanLaporan(laporanData);
        }
    });
    
    // Fungsi untuk update tampilan laporan
    function updateTampilanLaporan(data) {
        // Implementasi update tabel laporan
        const tableBody = document.querySelector('.report-table tbody');
        tableBody.innerHTML = ''; // Kosongkan tabel
        
        data.forEach(item => {
            const row = document.createElement('tr');
            
            row.innerHTML = `
                <td>${formatTanggal(item.tanggal)}</td>
                <td>${item.kelas}</td>
                <td>${item.sesi}</td>
                <td class="hadir">${item.hadir}</td>
                <td class="izin">${item.izin}</td>
                <td class="sakit">${item.sakit}</td>
                <td class="alpa">${item.alpa}</td>
            `;
            
            tableBody.appendChild(row);
        });
        
        // Update chart jika ada
        if(window.attendanceChart) {
            updateChart(data);
        }
    }
    
    // Fungsi helper untuk format tanggal
    function formatTanggal(dateString) {
        const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
        return new Date(dateString).toLocaleDateString('id-ID', options);
    }
    
    // Fungsi untuk update chart
    function updateChart(data) {
        // Kelompokkan data per kelas
        const summary = {
            'TQS 05': { hadir: 0, izin: 0, sakit: 0, alpa: 0 },
            'KHS 01': { hadir: 0, izin: 0, sakit: 0, alpa: 0 }
        };
        
        data.forEach(item => {
            summary[item.kelas].hadir += item.hadir;
            summary[item.kelas].izin += item.izin;
            summary[item.kelas].sakit += item.sakit;
            summary[item.kelas].alpa += item.alpa;
        });
        
        // Update chart data
        window.attendanceChart.data.datasets[0].data = [
            summary['TQS 05'].hadir,
            summary['TQS 05'].izin,
            summary['TQS 05'].sakit,
            summary['TQS 05'].alpa
        ];
        
        window.attendanceChart.data.datasets[1].data = [
            summary['KHS 01'].hadir,
            summary['KHS 01'].izin,
            summary['KHS 01'].sakit,
            summary['KHS 01'].alpa
        ];
        
        window.attendanceChart.update();
    }
    
    // Inisialisasi chart saat pertama kali load
    if(document.getElementById('summaryChart')) {
        initCharts();
    }
});

// Fungsi untuk inisialisasi chart
function initCharts() {
    const ctx = document.getElementById('summaryChart').getContext('2d');
    window.attendanceChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Hadir', 'Izin', 'Sakit', 'Alpa'],
            datasets: [
                {
                    label: 'TQS 05',
                    data: [0, 0, 0, 0], // Data awal
                    backgroundColor: '#4361ee',
                    borderColor: '#3f37c9',
                    borderWidth: 1
                },
                {
                    label: 'KHS 01',
                    data: [0, 0, 0, 0], // Data awal
                    backgroundColor: '#4cc9f0',
                    borderColor: '#3a0ca3',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Fungsi untuk export ke Excel
async function exportToExcel() {
    try {
        const filter = {
            kelas: document.getElementById('kelasFilter').value,
            bulan: document.getElementById('bulanFilter').value,
            tahun: document.getElementById('tahunFilter').value
        };
        
        const scriptUrl = `https://script.google.com/macros/s/AKfycbzYOK0qdK0BtcBC4H3GyWsKuALX8nZY1KHZzeenhdyvsNrPqPvS69gjlFZdthZGJ4aO/exec_EXPORT?kelas=${filter.kelas}&bulan=${filter.bulan}&tahun=${filter.tahun}`;
        
        const response = await fetch(scriptUrl);
        const blob = await response.blob();
        
        // Buat link download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Laporan_Absensi_${filter.kelas}_${filter.bulan}_${filter.tahun}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
    } catch (error) {
        console.error('Error:', error);
        alert('Terjadi kesalahan saat mengeksport data');
    }
}

// Tambahkan event listener untuk tombol export
document.addEventListener('DOMContentLoaded', function() {
    const exportBtn = document.querySelector('.btn-primary:contains("Export ke Excel")');
    if(exportBtn) {
        exportBtn.addEventListener('click', exportToExcel);
    }
});
