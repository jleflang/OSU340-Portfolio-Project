$('#toolCheck').on('show.bs.modal', function (event) {
    var req = new XMLHttpRequest();

    let uid = $(event.relatedTarget).data('id');

    req.open("GET", '/api?id=' + uid + '&base=0');
    req.send(null);

    req.addEventListener('load', function() {

        let response = JSON.parse(req.responseText);
        let head = ['ID', 'Name', 'Type', 'Material', 'Level', 'Enchantment'];

        var table = $('<table>').addClass('table');
        var header = $('<thead>');
        
        head.forEach(label => {
            let h = $('<th>' + label + '</th>').attr('scope', 'col');
            header.append(h);
        });

        table.append(header);

        response.rows.forEach(tool => {
            table.append(
                '<tr><td>' + tool.toolId + '</td>' +
                '<td>' + tool.toolName + '</td>' +
                '<td>' + tool.type + '</td>' +
                '<td>' + tool.material + '</td>' +
                '<td>' + tool.level + '</td>' +
                '<td>' + tool.toolEnchant + '</td></tr>'
            );
        });

        $('#toolsModalTable').append(table);

    });
}).on('hide.bs.modal', function (event) {
    $('#toolsModalTable').children('table').remove();
});

$('#equipCheck').on('show.bs.modal', function (event) {
    var req = new XMLHttpRequest();

    let uid = $(event.relatedTarget).data('id');

    req.open("GET", '/api?id=' + uid + '&base=1');
    req.send(null);

    req.addEventListener('load', function() {
        let response = JSON.parse(req.responseText);
        let head = ['ID', 'Name', 'Equipable Location', 'Weight', 'Material', 'Level', 'Enchantment'];

        var table = $('<table>').addClass('table');
        var header = $('<thead>');
        
        head.forEach(label => {
            let h = $('<th>' + label + '</th>').attr('scope', 'col');
            header.append(h);
        });

        table.append(header);

        response.rows.forEach(tool => {
            table.append(
                '<tr><td>' + tool.equipId + '</td>' +
                '<td>' + tool.equipName + '</td>' +
                '<td>' + tool.location + '</td>' +
                '<td>' + tool.weight + '</td>' +
                '<td>' + tool.material + '</td>' +
                '<td>' + tool.level + '</td>' +
                '<td>' + tool.equipEnchant + '</td></tr>'
            );
        });

        $('#equipModalTable').append(table);
    });
}).on('hide.bs.modal', function (event) {
    $('#equipModalTable').children('table').remove();
});