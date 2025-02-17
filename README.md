<p align="center">
  <img height="150" src="https://github.com/lafranceinsoumise/actionpopulaire.fr/blob/staging/agir/front/components/genericComponents/logos/action-populaire.svg">
</p>

![Tests status](https://github.com/lafranceinsoumise/actionpopulaire.fr/actions/workflows/run-tests.yml/badge.svg)

# actionpopulaire.fr

## Mise en place du projet

### Pré-requis
* Python >= 3.9
* Poetry >= 2.X
* Docker
* Lando >= 3.X

### Installation

```bash
git clone https://github.com/lafranceinsoumise/actionpopulaire.fr
cd actionpopulaire.fr
touch .env
lando start
lando manage migrate 

# Faire un super user pour la partie admin
lando manage createsuperperson --email yourEmail@email.com
```

Vous pourrez ensuite accéder à la partie front du projet via : http://ap.lfi.site/
Pour accéder à la partie admin via le compte précédemment créé : http://ap.lfi.site/admin

Chaque mail émis par le système est capturé par mailhog, que vous pouvez consulter via : http://mailhog.ap.lfi.site/

### Contribuer au projet

Pour contribuer au projet suivre les [guidelines](https://github.com/lafranceinsoumise/actionpopulaire.fr/blob/staging/GUIDELINES.md)


## Commandes utiles

### Base de données
Whenever you change the django models, you'll have to generate the migrations and apply them.

Generate, then apply the migrations :
```bash
lando manage makemigrations your_app
lando manage migrate 
```

### Tests

```bash
$ black agir/
$ node_modules/.bin/eslint --fix agir/
$ poetry run ./manage.py test
``` 

# Mise à jour suite au squashing des migrations du 7 janvier 2021

Si vous avez un environnement de développement déjà en place avant le 7 janvier,
vous devez réaliser les opérations suivantes pour qu'il reste fonctionnel.

Assurez-vous de d'abord réaliser toutes les migrations jusqu'au commit c5e16d4be173.
Ensuite, dans une console django, exécutez le script suivant :

```python
from django.db import connection

QUERY = """
INSERT INTO django_migrations (app, name, applied)
VALUES 
('people', '0001_creer_modeles', NOW()),
('people', '0002_objets_initiaux', NOW()),
('people', '0003_segments', NOW()),
('payments', '0001_creer_modeles', NOW()),
('groups', '0001_creer_modeles', NOW()),
('groups', '0002_creer_sous_types', NOW()),
('events', '0001_creer_modeles', NOW()),
('events', '0002_objets_initiaux_et_recherche', NOW());
"""

with connection.cursor() as cursor:
    cursor.execute(QUERY)
```

Les nouvelles migrations seront ainsi considérées comme déjà exécutées.

[django-server]: http://agir.local:8000/
[mailhog]: http://agir.local:8025/
[django-admin]: http://agir.local:8000/admin/
