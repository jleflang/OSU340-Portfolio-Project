feather.replace();

var toolModal = document.getElementById('toolCheck');

toolModal.addEventListener('show.bs.modal', function (event) {
    var req = new XMLHttpRequest();

    let uid = event.relatedTarget.id;

    req.open("GET", '/api?id=' + uid + '&base=0');
    req.send(null);

    req.addEventListener('load', function() {

        let response = JSON.parse(req.responseText);
        let head = ['Name', 'Type', 'Material', 'Level', 'Enchantment'];

        var table = document.createElement('table');
        table.setAttribute('class', 'table');

        var header = document.createElement('thead');
        
        head.forEach(label => {
            let h = document.createElement('th')
            h.setAttribute('scope', 'col');
            h.innerText = label;
            header.append(h);
        });

        table.append(header);

        response.rows.forEach(tool => {
            let row = document.createElement('tr');

            var data = document.createElement('td');
            data.innerText = tool.toolName;
            row.appendChild(data);
            var data = document.createElement('td');
            data.innerText = tool.type;
            row.appendChild(data);
            var data = document.createElement('td');
            data.innerText = tool.material;
            row.appendChild(data);
            var data = document.createElement('td');
            data.innerText = tool.level;
            row.appendChild(data);
            var data = document.createElement('td');
            data.innerText = tool.toolEnchant;
            row.appendChild(data);

            table.append(row);
        });

        document.getElementById('toolsModalTable').append(table);

    });
});

toolModal.addEventListener('hidden.bs.modal', function (event) {
    document.getElementById('toolsModalTable').firstChild.remove();
});

var equipModal = document.getElementById('equipCheck');

equipModal.addEventListener('show.bs.modal', function (event) {
    var req = new XMLHttpRequest();

    let uid = event.relatedTarget.id;

    req.open("GET", '/api?id=' + uid + '&base=1');
    req.send(null);

    req.addEventListener('load', function() {
        let response = JSON.parse(req.responseText);
        let head = ['Name', 'Equipable Location', 'Weight', 'Material', 'Level', 'Enchantment'];

        var table = document.createElement('table');
        table.setAttribute('class', 'table');

        var header = document.createElement('thead');
        
        head.forEach(label => {
            let h = document.createElement('th')
            h.setAttribute('scope', 'col');
            h.innerText = label;
            header.append(h);
        });

        table.append(header);

        response.rows.forEach(equip => {
            let row = document.createElement('tr');

            var data = document.createElement('td');
            data.innerText = equip.equipName;
            row.appendChild(data);
            var data = document.createElement('td');
            data.innerText = equip.location;
            row.appendChild(data);
            var data = document.createElement('td');
            data.innerText = equip.weight;
            row.appendChild(data);
            var data = document.createElement('td');
            data.innerText = equip.material;
            row.appendChild(data);
            var data = document.createElement('td');
            data.innerText = equip.level;
            row.appendChild(data);
            var data = document.createElement('td');
            data.innerText = equip.equipEnchant;
            row.appendChild(data);

            table.append(row);
        });

        document.getElementById('equipModalTable').append(table);
    });
});

equipModal.addEventListener('hidden.bs.modal', function (event) {
    document.getElementById('equipModalTable').firstChild.remove();
});