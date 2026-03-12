<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 15px; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            margin: 0;
            padding: 15px;
            line-height: 1.5;
            background: linear-gradient(to bottom, #f0f7ff 0%, #ffffff 100%);
        }

        /* Header avec logos */
        .header-top {
            display: table;
            width: 100%;
            margin-bottom: 12px;
            border-bottom: 3px solid #2563eb;
            padding-bottom: 12px;
            background: linear-gradient(to right, #eff6ff, #dbeafe, #eff6ff);
            border-radius: 8px 8px 0 0;
            padding: 10px;
        }
        .header-left, .header-right {
            display: table-cell;
            width: 35%;
            vertical-align: top;
            font-size: 8px;
            color: #1e3a8a;
        }
        .header-center {
            display: table-cell;
            width: 30%;
            text-align: center;
            vertical-align: middle;
        }
        .header-left { text-align: left; }
        .header-right { text-align: right; }
        .logo-placeholder {
            width: 60px;
            height: 60px;
            border: 2px solid #3b82f6;
            display: inline-block;
            background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
            border-radius: 8px;
        }

        /* Titre principal */
        .main-title {
            text-align: center;
            margin: 18px 0;
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            padding: 15px;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(37, 99, 235, 0.1);
        }
        .main-title h1 {
            font-size: 15px;
            font-weight: bold;
            margin: 5px 0;
            text-transform: uppercase;
            color: #ffffff;
            letter-spacing: 0.5px;
        }
        .main-title .subtitle {
            font-size: 11px;
            font-weight: bold;
            margin: 5px 0;
            color: #bfdbfe;
        }
        .inscription-number {
            text-align: right;
            font-size: 11px;
            font-weight: bold;
            color: #1e40af;
            margin: 12px 0;
            background: #eff6ff;
            padding: 8px 12px;
            border-radius: 8px;
            border-left: 4px solid #3b82f6;
        }

        /* Sections */
        .section {
            margin: 12px 0;
            border: 2px solid #93c5fd;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 2px 4px rgba(59, 130, 246, 0.08);
        }
        .section-header {
            background: linear-gradient(135deg, #2563eb 0%, #3b82f6 100%);
            color: #ffffff;
            padding: 7px 12px;
            font-weight: bold;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .section-content {
            padding: 10px;
            background: #ffffff;
        }

        /* Tableau d'informations */
        .info-table { width: 100%; border-collapse: collapse; }
        .info-table td { padding: 5px 10px; font-size: 9px; vertical-align: top; }
        .info-table .label { font-weight: bold; width: 35%; color: #1e40af; }
        .info-table .value { width: 65%; color: #1e3a8a; }
        .info-row {
            display: table;
            width: 100%;
            margin-bottom: 4px;
            background: linear-gradient(to right, #f0f9ff 0%, #ffffff 100%);
            padding: 4px;
            border-radius: 4px;
        }
        .info-col {
            display: table-cell;
            width: 50%;
            padding-right: 12px;
            font-size: 9px;
        }

        /* Instructions bleues */
        .instructions {
            background: linear-gradient(135deg, #dbeafe 0%, #eff6ff 100%);
            border: 2px solid #3b82f6;
            padding: 12px;
            margin: 18px 0;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(59, 130, 246, 0.1);
        }
        .instructions h3 {
            color: #1e40af;
            font-size: 10px;
            font-weight: bold;
            margin: 0 0 10px 0;
            text-transform: uppercase;
            border-bottom: 2px solid #60a5fa;
            padding-bottom: 5px;
        }
        .instructions ul {
            margin: 6px 0;
            padding-left: 22px;
        }
        .instructions li {
            color: #1e3a8a;
            font-size: 8px;
            margin: 4px 0;
            line-height: 1.4;
        }
        .instructions .warning {
            font-weight: bold;
            text-decoration: underline;
            color: #1e40af;
        }

        /* QR Code et Code candidat */
        .footer-section {
            margin-top: 22px;
            display: table;
            width: 100%;
            background: linear-gradient(to right, #eff6ff, #dbeafe, #eff6ff);
            padding: 12px;
            border-radius: 10px;
            border: 2px solid #93c5fd;
        }
        .qr-section {
            display: table-cell;
            width: 30%;
            text-align: center;
            vertical-align: middle;
        }
        .qr-code {
            border: 3px solid #2563eb;
            padding: 10px;
            display: inline-block;
            background: #ffffff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(37, 99, 235, 0.15);
        }
        .candidate-code {
            display: table-cell;
            width: 70%;
            text-align: right;
            vertical-align: bottom;
        }
        .candidate-code p {
            font-size: 11px;
            margin: 6px 0;
            color: #1e3a8a;
        }
        .candidate-code .code {
            font-size: 17px;
            font-weight: bold;
            font-family: monospace;
            color: #1e40af;
            background: #ffffff;
            padding: 4px 8px;
            border-radius: 4px;
            border: 1px solid #93c5fd;
        }

        /* Date d'impression */
        .print-date {
            text-align: right;
            font-size: 8px;
            font-style: italic;
            margin-top: 10px;
            color: #60a5fa;
        }

        /* Styles spéciaux */
        .bold { font-weight: bold; }
        .blue { color: #2563eb; }
        .uppercase { text-transform: uppercase; }

        /* Timbre fiscal */
        .fiscal-stamp {
            float: right;
            border: 2px solid #3b82f6;
            padding: 4px 10px;
            font-size: 9px;
            background: #ffffff;
            border-radius: 6px;
            color: #1e40af;
            font-weight: bold;
        }

        /* Amélioration visuelle des sections */
        .info-col strong {
            color: #1e40af;
            font-weight: bold;
        }

        /* Style pour les documents nécessaires */
        .documents-section {
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
            border-radius: 6px;
            padding: 8px;
            margin-top: 5px;
        }

        .documents-section p {
            color: #1e3a8a;
            margin: 3px 0;
        }
    </style>
</head>
<body>
    <!-- En-tête avec logos -->
    <div class="header-top">
        <div class="header-left">
            <strong>RÉPUBLIQUE DU CAMEROUN</strong><br>
            Paix - Travail - Patrie<br>
            <br>
            <strong>MINISTÈRE DE L'ENSEIGNEMENT SUPÉRIEUR</strong><br>
            <br>
            @if($enrollement->etudiant->concours)
            <strong>{{ strtoupper($enrollement->etudiant->concours->nom) }}</strong><br>
            {{ $enrollement->etudiant->concours->ville ?? '' }}
            @endif
        </div>
        <div class="header-center">
            @if($enrollement->etudiant->concours && $enrollement->etudiant->concours->logo)
                <img src="{{ public_path('storage/' . $enrollement->etudiant->concours->logo) }}" style="width: 60px; height: 60px; object-fit: contain;" alt="Logo">
            @else
                <div class="logo-placeholder">LOGO</div>
            @endif
        </div>
        <div class="header-right">
            <strong>REPUBLIC OF CAMEROON</strong><br>
            Peace - Work - Fatherland<br>
            <br>
            <strong>MINISTRY OF HIGHER EDUCATION</strong><br>
            <br>
            @if($enrollement->etudiant->concours)
            <strong>{{ strtoupper($enrollement->etudiant->concours->nom) }}</strong><br>
            {{ $enrollement->etudiant->concours->ville ?? '' }}
            @endif
        </div>
    </div>

    <!-- Titre principal -->
    <div class="main-title">
        <h1>FICHE D'INSCRIPTION AU CONCOURS D'ENTRÉE SESSION {{ date('Y') }}</h1>
        @if($enrollement->etudiant->concours)
        <div class="subtitle">{{ strtoupper($enrollement->etudiant->concours->nom) }}</div>
        @endif
    </div>

    <div class="inscription-number">
        INSCRIPTION N° <span class="blue" style="font-size: 13px;">{{ str_pad($enrollement->id, 6, '0', STR_PAD_LEFT) }}</span>
        <span class="fiscal-stamp">Timbre Fiscal et/ou Stamp here</span>
    </div>

    <!-- Informations Personnelles -->
    <div class="section">
        <div class="section-header">📋 Informations Personnelles / Personal Information</div>
        <div class="section-content">
            <div class="info-row">
                <div class="info-col">
                    <strong>Nom:</strong> {{ strtoupper($enrollement->etudiant->user->nom) }}
                </div>
                <div class="info-col">
                    <strong>Prénom:</strong> {{ $enrollement->etudiant->user->prenom }}
                </div>
            </div>
            <div class="info-row">
                <div class="info-col">
                    <strong>Date de naissance:</strong> {{ \Carbon\Carbon::parse($enrollement->etudiant->date_naissance)->format('d-m-Y') }}
                </div>
                <div class="info-col">
                    <strong>Lieu de naissance:</strong> {{ $enrollement->etudiant->departement_origine ?? 'N/A' }}
                </div>
            </div>
            <div class="info-row">
                <div class="info-col">
                    <strong>Sexe:</strong> {{ $enrollement->etudiant->sexe == 'M' ? 'Masculin' : 'Féminin' }}
                </div>
                <div class="info-col">
                    <strong>Nationalité:</strong> Cameroun
                </div>
            </div>
            <div class="info-row">
                <div class="info-col">
                    <strong>Région d'origine:</strong> {{ $enrollement->etudiant->region_origine ?? 'N/A' }}
                </div>
                <div class="info-col">
                    <strong>Département d'origine:</strong> {{ $enrollement->etudiant->departement_origine ?? 'N/A' }}
                </div>
            </div>
            <div class="info-row">
                <div class="info-col">
                    <strong>CNI:</strong> {{ $enrollement->etudiant->numero_cni ?? 'N/A' }}
                </div>
                <div class="info-col">
                    <strong>Téléphone:</strong> {{ $enrollement->etudiant->telephone ?? 'N/A' }}
                </div>
            </div>
            <div class="info-row">
                <div class="info-col">
                    <strong>Adresse:</strong> {{ $enrollement->etudiant->adresse }}
                </div>
                <div class="info-col">
                    <strong>Email:</strong> {{ $enrollement->etudiant->user->email }}
                </div>
            </div>
            <div class="info-row">
                <div class="info-col">
                    <strong>Langue parlée:</strong> {{ $enrollement->etudiant->langue_parlee ?? 'Français' }}
                </div>
            </div>
        </div>
    </div>

    <!-- Informations Académiques -->
    <div class="section">
        <div class="section-header">🎓 Informations Académiques / Academic Information</div>
        <div class="section-content">
            <div class="info-row">
                <div class="info-col">
                    <strong>Filière:</strong> {{ $enrollement->filiere->nom }}
                </div>
                <div class="info-col">
                    <strong>Diplôme/admission:</strong> {{ $enrollement->niveau->nom ?? 'N/A' }}
                </div>
            </div>
            <div class="info-row">
                <div class="info-col">
                    <strong>Mention:</strong> PASSABLE
                </div>
                <div class="info-col">
                    <strong>Année diplôme:</strong> {{ date('Y') }}
                </div>
            </div>
            <div class="info-row">
                <div class="info-col">
                    <strong>Centre d'examen:</strong> {{ $enrollement->etudiant->centreExamen->nom ?? 'N/A' }}
                </div>
                <div class="info-col">
                    <strong>Centre de dépôt:</strong> {{ $enrollement->centreDepot->nom ?? 'N/A' }}
                </div>
            </div>
        </div>
    </div>

    <!-- Autres Informations -->
    <div class="section">
        <div class="section-header">👨‍👩‍👦 Autres Informations / Others Information</div>
        <div class="section-content">
            <div class="info-row">
                <div class="info-col">
                    <strong>Nom du père:</strong> {{ $enrollement->etudiant->nom_pere ?? 'N/A' }}
                </div>
                <div class="info-col">
                    <strong>Téléphone du père:</strong> {{ $enrollement->etudiant->telephone_pere ?? 'N/A' }}
                </div>
            </div>
            <div class="info-row">
                <div class="info-col">
                    <strong>Nom de la mère:</strong> {{ $enrollement->etudiant->nom_mere ?? 'N/A' }}
                </div>
                <div class="info-col">
                    <strong>Téléphone de la mère:</strong> {{ $enrollement->etudiant->telephone_mere ?? 'N/A' }}
                </div>
            </div>
        </div>
    </div>

    <!-- Documents Nécessaires -->
    <div class="section">
        <div class="section-header" style="background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);">📄 Documents Nécessaires / Necessary Documents</div>
        <div class="section-content">
            <div class="documents-section">
                <p style="font-size: 8px; margin: 0; font-weight: bold;"><strong>Les documents suivants sont à fournir dans les trois (3) mois:</strong></p>
                <p style="font-size: 8px; margin: 5px 0; line-height: 1.5;">
                    • Acte de naissance légalisé • Diplôme du BAC • Relevé de notes • Photo d'identité • CNI • Certificat médical
                </p>
            </div>
        </div>
    </div>

    <!-- Instructions importantes -->
    <div class="instructions">
        <h3>⚠️ INSTRUCTIONS IMPORTANTES / IMPORTANT INSTRUCTIONS</h3>
        <ul>
            <li><span class="warning">Le paiement des frais d'inscription doit être effectué dans les 7 jours</span> suivant la soumission de ce formulaire. Le non-respect de ce délai entraînera l'annulation automatique de votre inscription.</li>
            <li>Les documents doivent être déposés au centre de dépôt choisi <span class="warning">dans les trois (3) mois</span> à partir de la date d'inscription. Un délai médical supplémentaire de 3 mois peut être accordé sur présentation d'un certificat médical valide.</li>
            <li>Tout document falsifié ou incomplet entraînera <span class="warning">l'annulation immédiate</span> de votre candidature et des poursuites judiciaires.</li>
            <li>Les frais d'inscription ne sont <span class="warning">ni remboursables ni transférables</span> sous aucune circonstance.</li>
            <li>Le candidat doit se présenter au centre d'examen <span class="warning">30 minutes avant le début</span> de l'épreuve avec cette fiche et une pièce d'identité valide.</li>
            <li>Toute tentative de fraude ou de tricherie sera sanctionnée par <span class="warning">l'exclusion définitive</span> du concours et une interdiction de participer aux concours futurs.</li>
            <li>Le candidat est responsable de vérifier régulièrement son email et son espace personnel pour les mises à jour importantes concernant le concours.</li>
        </ul>
    </div>

    <!-- Footer avec QR Code -->
    <div class="footer-section">
        <div class="qr-section">
            <div class="qr-code">
                <img src="data:image/svg+xml;base64,{{ $qrcode }}" width="80">
            </div>
            <p style="font-size: 7px; margin: 5px 0; color: #1e40af; font-weight: bold;">Scanner pour vérification</p>
        </div>
        <div class="candidate-code">
            <p><strong style="color: #1e40af;">Code Candidat:</strong> <span class="code">{{ str_pad($enrollement->id, 6, '0', STR_PAD_LEFT) }}</span></p>
            <p style="margin-top: 8px; font-size: 9px; color: #1e3a8a;">
                <strong>Année académique:</strong> {{ $enrollement->annee_academique }}
            </p>
            <p class="print-date">Imprimée le {{ $date }}</p>
        </div>
    </div>
</body>
</html>
