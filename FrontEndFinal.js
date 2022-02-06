class Party {
    constructor(name) {
        this.name = name;
        this.players = [];
    }

    addPlayer(name, job, level)  {
        this.players.push(new Party(name, job, level));
    }
}

class Player {
    constructor(name, job, level) {
        this.name = name;
        this.job = job;
        this.level = level;
    }
}

class PartyService {
    static url =
      "https://62002bec5e1c4100174f70a9.mockapi.io/:endpoint";
  
    static getAllParties() {
      return $.get(this.url);
    }
  
    static getParty(id) {
      return $.get(this.url + `${id}`);
    }
  
    static createParty(list) {
      return $.ajax({
        type: "POST",
        url: this.url,
        data: JSON.stringify(list),
        contentType: "application/json",
      });
    }
  
    static updateParty(list) {
      const listId = list._id;
      delete list._id;
  
      return $.ajax({
        type: "PUT",
        url: `${this.url}/${listId}`,
        data: JSON.stringify(list),
        contentType: "application/json",
      });
    }
  
    static deleteParty(id) {
      return $.ajax({
        url: this.url + `/${id}`,
        type: "DELETE",
      });
    }
}

class DOMManager {
    static parties;

    static getAllParties() {
        PartyService.getAllParties().then(parties => this.render(parties));
    }

    static createParty(name) {
        PartyService.createParty(new Party(name))
            .then(() => {
                return PartyService.getAllParties();
            })
            .then((parties) => this.render(parties));
    }

    static deleteParty(id) {
        PartyService.deleteParty(id)
            .then(() => {
                return PartyService.getAllParties();
            })
            .then((parties) => this.render(parties));
    }

    static addPlayer(id) {
        for (let party of this.parties) {
            if (party._id == id) {
                party.rooms.push(new Player($(`#${party._id}-player-name`).val(), $(`#${party._id}-player-job`).val(), $(`#${party._id}-player-level`).val()));
                PartyService.updateParty(party)
                    .then(() => {
                        return PartyService.getAllParties();
                    })
                    .then((parties) => this.render(parties));
            }
        }
    }

    static deletePlayer(partyId, playerId) {
        for (let party of this.parties) {
            if (party._id == partyId) {
                for (let player of party.players) {
                    if (player._id == playerId) {
                        party.rooms.splice(party.players.indexOf(player), 1);
                        PartyService.updateParty(party)
                            .then(() => {
                                return PartyService.getAllParties();
                            })
                            .then((parties) => this.render(parties));
                    }
                }
            }
        }
    }

    static render(parties) {
        this.parties = parties;
        $('#app').empty();
        for (let party of parties) {
            $('#app').prepend(
                `<div id="${party._id}" class="card">
                    <div class="card-header">
                        <h2>${party.name}</h2>
                        <button class="btn btn-danger" onclick="DOMManager.deleteParty('${party._id}')">Delete</button>
                    </div>
                    <div class="card-body">
                        <div class="card">
                            <div class="row">
                                <div class="col-sm">
                                    <input type="text" id="${party._id}-player-name" class="form-control" placeholder="Player Name">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${party._id}-player-job" class="form-control" placeholder="Player Job">
                                </div>
                                <div class="col-sm">
                                    <input type="text" id="${party._id}-player-level" class="form-control" placeholder="Player Level">
                                </div>
                            </div>
                            <button id="${party._id}-new-player" onclick="DOMManager.addPlayer('${party._id}')" class="btn btn-primary form-control">Add</button>
                        </div>
                    </div>
                </div><br>`
            );
            for (const player of party.players) {
                $(`#${party._id}`).find('.card-body').append(
                    `<p>
                        <span id="name-${player._id}"><strong>Name: </strong> ${player.name}</span>
                        <span id="name-${player._id}"><strong>Job: </strong> ${player.job}</span>
                        <span id="name-${player._id}"><strong>Level: </strong> ${player.level}</span>
                        <button class="btn btn-danger" onclick="DOMManager.deletePlayer('${party._id}', '${player._id}')">Delete Room</button>`
                );
            }
        }
    }
}

$('#new-party').on('click', () => {
    DOMManager.createParty($('#party-name').val());
    $('#party-name').val('');
});

DOMManager.getAllParties();