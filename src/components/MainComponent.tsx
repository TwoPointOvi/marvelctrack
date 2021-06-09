import { Button } from '@material-ui/core';
import React from 'react';
import { MARVELCDB_CARDS, MARVELCDB_PACKS } from '../shared/urls';

type MainComponentState = {
    isLoadingHeroes: boolean,
    isLoadingVillains: boolean,
    cardCollection: any,
    heroes: any,
    villains: any
}

class MainComponent extends React.Component<{}, {}> {
    state: MainComponentState = {
        isLoadingHeroes: true,
        isLoadingVillains: true,
        cardCollection: [],
        heroes: [],
        villains: []
    }

    constructor(props: any) {
        super(props);
    }

    componentDidMount() {
        this.getCollectionFromURL();
        this.getPackInfoFromURL();
    }

    getCollectionFromURL() {
        return fetch(MARVELCDB_CARDS)
            .then((res) => res.json())
            .then((resJSON) => {
                const cardCollection = this.cardCollection(resJSON);
                const heroes = this.heroCollection(resJSON);
                this.setState({
                    heroes: heroes,
                    cardCollection: cardCollection
                });
            })
            .catch(error => console.error(error))
            .finally(() => {
                this.setState({
                    isLoadingHeroes: false
                });
            });
    }

    getPackInfoFromURL() {
        return fetch(MARVELCDB_PACKS)
            .then((res) => res.json())
            .then((resJSON) => {
                this.getVillainsFromPack(resJSON);
            })
            .catch(error => console.error(error));
    }

    getVillainsFromPack(packs: any) {
        const packPromises: any = [];
        packs.forEach((packInfo: any) => {
            packPromises.push(fetch(MARVELCDB_CARDS + packInfo.code + '.json'));
        });
            
        Promise.all(packPromises)
            .then((responses: any) => {
                const cardsPromises: any = [];
                responses.forEach((packCards: any) => {
                    cardsPromises.push(packCards.json())
                });

                Promise.all(cardsPromises)
                    .then((responsesJSON: any) => {
                        const villains: any = [];
                        responsesJSON.forEach((cards: any) => {
                            villains.push(...this.villainCollection(cards));
                        });
                        this.setState({
                            villains: villains
                        });
                    })
                    .finally(() => {
                        this.setState({
                            isLoadingVillains: false
                        });
                    });
            });
    }

    cardCollection(res: any) {
        const cardCollection = res.filter((card: any) => card.type_code !== 'hero' && card.type_code !== 'alter_ego' &&
                                                card.type_code !== 'villain' &&
                                                card.type_code !== 'side_scheme' && card.type_code !== 'main_scheme' &&
                                                card.type_code !== 'minion' && card.type_code !== 'attachment' &&
                                                card.type_code !== 'treachery');
        return cardCollection;
    }

    heroCollection(res: any) {
        const heroes = res.filter((card: any) => card.type_code === 'hero' ||
                                                card.type_code === 'alter_ego');
        return heroes;
    }

    villainCollection(res: any) {
        const villains = res.filter((card: any) => card.type_code === 'villain');
        return villains;
    }

    render() {
        if (this.state.isLoadingHeroes && this.state.isLoadingVillains) {
            return (
                <h2>Loading...</h2>
            );
        } else {
            return (
                <div>
                    <Button onClick={() => {console.log(this.state.villains)}}>
                        Villains
                    </Button>
                    <Button onClick={() => {console.log(this.state.heroes)}}>
                        Heroes
                    </Button>
                    <Button onClick={() => {console.log(this.state.cardCollection)}}>
                        Card Collection
                    </Button>
                </div>
            );
        }
    }
}

export default MainComponent;