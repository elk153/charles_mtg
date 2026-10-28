# building the binder and  capability

## context

- use the <https://github.com/elk153/oracle_binder/tree/binder-deck-1> branch as baseline
- a user can currently add/remove a card to favorites
- the first objective is to build a card-binder feature
- the second objective is to build a card-binder feature
- the feature will keep the same approach and libraries than favorites, card-filters, card-browser, etc.
- a card is added/removed from the binder using the dedicated icon located on the cards
- keep the same approch of minimizing the queries
- add helping tables if required

## card-binder features

- create a binder table in the database using migration
- if a card is both in favorites and binder, both icons will be marking it
- a same card can be added multiple times in the binder
- database will track when card is added/modified
- each added card will have the possibility to record metadata (e.g., gift/purchased new, purchased second had, new/good state/played/worn, sold/lost/offered, purchased alone/purchased in deck/purchased in booster, etc.) propose interesting metadata
- adding the metadata overlay will be triggered by clicking the icon to add it to the binder
- hovering the icon (desktop) or clicking the icon (mobile) will display the metadata. modifiy/save/cancel buttons will be used to trigger edition mode.
- there shall be a difference between deleting a card (delete all data) and marking the card sold/lost/offered (data is kept in database)
- the binder shall allow to have different binders. binders will have a name given by the user and the illustation will be the most legendary/rare card belonging to the binder.
- binder feature will propose views for all cards or a binder list. clicking a binder will list the cards from the binder
- cards not in a binder will be part of a 'loose' binder.
-  deleting a binder will move its cards to the loose

## card-deck features

- the decks 
- create a decks table in the databse using migration
- card decks can use cards from the binder, proxies or virtual.
- proxies shall appear in the decks they are added to. proxies shall be recognisable with hashed border around the card.
- virtual cards are cards planned for a deck but not physically/proxy added
- one card from the binder can only exist in one deck
- if a card is removed from a deck, it can be switched to virtual or proxy
- the logic/visual to add/remove/modify/etc. shall be the same as for the binder
- decks management/vizualisation will follow the same logic as binders

## other changes

- align all icons theme
- in the NavBar replace collection by binder
- modify the logout icon (desktop and mobile) by creating an svg icon matching the theme and behavior of the others. store it as the other icons.
- on the cards, chhange the order of the icons and set the flip as last
- in card details:
  - have the "power" show next to the mana cost
  - add a row with the card color's using pills with color+text
  - have pills with the rarity

## plan

- analyze the requested features for comprehensibility and ask question to make it complete
- convert the prompt into a step-by-step plan through a decision list for implementation
