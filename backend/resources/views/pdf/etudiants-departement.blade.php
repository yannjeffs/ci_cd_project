<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <style>
        @page { margin: 20px; }
        body { 
            font-family: 'DejaVu Sans', sans-serif; 
            font-size: 9px; 
            margin: 0; 
            padding: 20px;
            background: linear-gradient(to bottom, #0f172a 0%, #1e293b 100%);
            color: #e2e8f0;
        }
        
        /* En-tête redessiné avec bannière */
        .header-banner {
            background: linear-gradient(135deg, #1e3a8a 0%, #3b82f6 50%, #1e40af 100%);
            padding: 20px;
            border-radius: 12px;
            margin-bottom: 20px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 8px 16px rgba(30, 58, 138, 0.3);
        }
        
        .header-banner::before {
            content: '';
            position: absolute;
            top: -50%;
            right: -10%;
            width: 200px;
            height: 200px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 50%;
        }
        
        .header-banner::after {
            content: '';
            position: absolute;
            bottom: -30%;
            left: -5%;
            width: 150px;
            height: 150px;
            background: rgba(255, 255, 255, 0.05);
            border-radius: 50%;
        }
        
        .header-content {
            position: relative;
            z-index: 1;
        }
        
        .republic-seal {
            text-align: center;
            margin-bottom: 12px;
            border-bottom: 2px solid rgba(255, 255, 255, 0.3);
            padding-bottom: 10px;
        }
        
        .republic-seal h1 {
            color: #ffffff;
            margin: 0;
            font-size: 16px;
            text-transform: uppercase;
            letter-spacing: 1px;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .republic-seal p {
            color: #bfdbfe;
            margin: 3px 0;
            font-size: 10px;
            font-style: italic;
        }
        
        .document-title {
            text-align: center;
            margin-top: 10px;
        }
        
        .document-title h2 {
            color: #ffffff;
            margin: 8px 0;
            font-size: 18px;
            text-transform: uppercase;
            letter-spacing: 1.5px;
            text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
        }
        
        .document-title .subtitle {
            color: #dbeafe;
            font-size: 11px;
            font-weight: bold;
            margin: 5px 0;
        }
        
        /* Carte d'information redessinée */
        .info-card {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-left: 5px solid #3b82f6;
            padding: 15px;
            margin-bottom: 20px;
            border-radius: 8px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        }
        
        .info-grid {
            display: table;
            width: 100%;
        }
        
        .info-row {
            display: table-row;
        }
        
        .info-cell {
            display: table-cell;
            padding: 5px 10px;
            width: 50%;
        }
        
        .info-label {
            color: #94a3b8;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
            font-weight: bold;
        }
        
        .info-value {
            color: #e2e8f0;
            font-size: 10px;
            font-weight: bold;
        }
        
        .info-value.highlight {
            color: #60a5fa;
            font-size: 12px;
        }
        
        /* Tableau redessiné avec style moderne */
        .table-container {
            background: #1e293b;
            border-radius: 8px;
            overflow: hidden;
            margin-bottom: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.4);
        }
        
        table {
            width: 100%;
            border-collapse: collapse;
        }
        
        thead tr {
            background: linear-gradient(135deg, #1e40af 0%, #2563eb 100%);
        }
        
        th {
            color: #ffffff;
            padding: 10px 8px;
            text-align: left;
            font-size: 8px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: bold;
            border-right: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        th:last-child {
            border-right: none;
        }
        
        tbody tr {
            border-bottom: 1px solid #334155;
            transition: background 0.3s;
        }
        
        tbody tr:nth-child(odd) {
            background: #0f172a;
        }
        
        tbody tr:nth-child(even) {
            background: #1e293b;
        }
        
        td {
            padding: 8px;
            font-size: 9px;
            color: #cbd5e1;
        }
        
        .row-number {
            color: #60a5fa;
            font-weight: bold;
            text-align: center;
        }
        
        .matricule {
            font-family: monospace;
            font-weight: bold;
            color: #3b82f6;
            background: rgba(59, 130, 246, 0.1);
            padding: 3px 6px;
            border-radius: 4px;
            display: inline-block;
        }
        
        .student-name {
            color: #f1f5f9;
            font-weight: bold;
        }
        
        /* Badges de statut redessinés */
        .status-badge {
            padding: 3px 8px;
            border-radius: 4px;
            font-size: 7px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            display: inline-block;
        }
        
        .status-valide {
            background: linear-gradient(135deg, #059669 0%, #10b981 100%);
            color: #ffffff;
        }
        
        .status-attente {
            background: linear-gradient(135deg, #d97706 0%, #f59e0b 100%);
            color: #ffffff;
        }
        
        .status-rejete {
            background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
            color: #ffffff;
        }
        
        /* Footer statistique */
        .stats-footer {
            background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
            padding: 12px 20px;
            border-radius: 8px;
            margin-bottom: 15px;
            box-shadow: 0 4px 8px rgba(30, 64, 175, 0.3);
        }
        
        .stats-footer .total-label {
            color: #bfdbfe;
            font-size: 9px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .stats-footer .total-value {
            color: #ffffff;
            font-size: 16px;
            font-weight: bold;
            margin-left: 10px;
        }
        
        /* Footer document */
        .document-footer {
            position: fixed;
            bottom: 15px;
            left: 20px;
            right: 20px;
            text-align: center;
            border-top: 2px solid #334155;
            padding-top: 10px;
        }
        
        .document-footer p {
            color: #64748b;
            font-size: 7px;
            margin: 3px 0;
            line-height: 1.4;
        }
        
        .document-footer .confidential {
            color: #94a3b8;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        /* Message vide redessiné */
        .empty-state {
            text-align: center;
            padding: 50px 20px;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border-radius: 8px;
            margin: 20px 0;
        }
        
        .empty-state-icon {
            font-size: 48px;
            margin-bottom: 15px;
            opacity: 0.3;
        }
        
        .empty-state p {
            color: #64748b;
            font-size: 11px;
            margin: 5px 0;
        }
        
        /* Watermark subtil */
        .watermark {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%) rotate(-45deg);
            font-size: 80px;
            color: rgba(59, 130, 246, 0.03);
            font-weight: bold;
            z-index: -1;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <!-- Watermark -->
    <div class="watermark">SGEE</div>

    <!-- En-tête avec bannière -->
    <div class="header-banner">
        <div class="header-content">
            <div class="republic-seal">
                <h1>République du Cameroun</h1>
                <p>Paix - Travail - Patrie</p>
            </div>
            <div class="document-title">
                <h2>Liste des Étudiants Inscrits</h2>
                <div class="subtitle">{{ $departement->nom }}</div>
            </div>
        </div>
    </div>

    <!-- Carte d'information -->
    <div class="info-card">
        <div class="info-grid">
            <div class="info-row">
                <div class="info-cell">
                    <div class="info-label">Département</div>
                    <div class="info-value highlight">{{ $departement->nom }}</div>
                </div>
                <div class="info-cell">
                    <div class="info-label">Total Étudiants</div>
                    <div class="info-value highlight">{{ count($etudiants) }}</div>
                </div>
            </div>
            <div class="info-row">
                <div class="info-cell">
                    <div class="info-label">Description</div>
                    <div class="info-value">{{ $departement->description ?? 'Non spécifiée' }}</div>
                </div>
                <div class="info-cell">
                    <div class="info-label">Date d'extraction</div>
                    <div class="info-value">{{ $date }}</div>
                </div>
            </div>
        </div>
    </div>

    @if(count($etudiants) > 0)
    <!-- Tableau des étudiants -->
    <div class="table-container">
        <table>
            <thead>
                <tr>
                    <th style="width: 5%;">N°</th>
                    <th style="width: 13%;">Matricule</th>
                    <th style="width: 22%;">Nom & Prénoms</th>
                    <th style="width: 7%;">Sexe</th>
                    <th style="width: 16%;">Filière</th>
                    <th style="width: 14%;">École/Concours</th>
                    <th style="width: 13%;">Téléphone</th>
                    <th style="width: 10%;">Statut</th>
                </tr>
            </thead>
            <tbody>
                @foreach($etudiants as $index => $etudiant)
                <tr>
                    <td class="row-number">{{ $index + 1 }}</td>
                    <td><span class="matricule">{{ $etudiant->matricule }}</span></td>
                    <td class="student-name">{{ strtoupper($etudiant->user->nom) }} {{ $etudiant->user->prenom }}</td>
                    <td style="text-align: center;">{{ $etudiant->sexe == 'M' ? 'M' : 'F' }}</td>
                    <td>{{ $etudiant->filiere->nom ?? '-' }}</td>
                    <td>{{ $etudiant->concours->code ?? '-' }}</td>
                    <td>{{ $etudiant->telephone ?? $etudiant->user->telephone ?? '-' }}</td>
                    <td>
                        @php
                            $enrollement = $etudiant->enrollements->first();
                            $statut = $enrollement ? $enrollement->statut : 'N/A';
                        @endphp
                        @if($statut != 'N/A')
                        <span class="status-badge {{ $statut == 'VALIDE' ? 'status-valide' : ($statut == 'REJETE' ? 'status-rejete' : 'status-attente') }}">
                            {{ $statut }}
                        </span>
                        @else
                        <span style="color: #64748b; font-size: 7px;">{{ $statut }}</span>
                        @endif
                    </td>
                </tr>
                @endforeach
            </tbody>
        </table>
    </div>

    <!-- Footer statistique -->
    <div class="stats-footer">
        <span class="total-label">Total des étudiants inscrits :</span>
        <span class="total-value">{{ count($etudiants) }}</span>
        <span class="total-label" style="margin-left: 20px;">
            @php
                $valides = collect($etudiants)->filter(function($etudiant) {
                    $enrollement = $etudiant->enrollements->first();
                    return $enrollement && $enrollement->statut == 'VALIDE';
                })->count();
                $attente = collect($etudiants)->filter(function($etudiant) {
                    $enrollement = $etudiant->enrollements->first();
                    return $enrollement && in_array($enrollement->statut, ['EN_ATTENTE', 'COMPLET']);
                })->count();
            @endphp
            Validés : <span style="color: #ffffff; font-weight: bold;">{{ $valides }}</span> | 
            En attente : <span style="color: #ffffff; font-weight: bold;">{{ $attente }}</span>
        </span>
    </div>
    @else
    <!-- État vide -->
    <div class="empty-state">
        <div class="empty-state-icon">📋</div>
        <p style="font-size: 13px; color: #94a3b8; font-weight: bold;">Aucun étudiant inscrit</p>
        <p>Ce département ne contient actuellement aucun étudiant inscrit.</p>
    </div>
    @endif

    <!-- Footer du document -->
    <div class="document-footer">
        <p><strong>SGEE</strong> - Système de Gestion d'Enrôlement des Étudiants | Document généré le {{ $date }}</p>
        <p class="confidential">⚠ Document strictement confidentiel - Usage administratif uniquement</p>
    </div>
</body>
</html>