clear;
close all;

% Anfangsbedingungen
Tstar_01 = 1;
Tstar_02 = 1.1;
Tstar_0  = Tstar_01 - Tstar_02;
Sstar_01 = 1.1;
Sstar_02 = 1;
Sstar_0  = Sstar_01 - Sstar_02;

% Austauschraten
k_T = 1;
k_S = 1;

% weitere Proportionalitätskonstanten
a = 1;
b = 1;
c = 1;

% dimensionslose Konstanten
alpha = 2*(a*b/k_T)*Tstar_0;
beta  = 2*(a*c/k_T)*Sstar_0;
gamma = k_S/k_T;

% T^*_i(t): Temperatur zum Zeitpunkt t
Tstar_1 = [Tstar_01];
Tstar_2 = [Tstar_02];
Tstar   = [Tstar_0]; % Differenz
T       = [Tstar(end)/Tstar_0]; % dimensionslose Differenz

% S^*_i(t): Salzgehalt zum Zeitpunkt t
Sstar_1 = [Sstar_01];
Sstar_2 = [Sstar_02];
Sstar   = [Sstar_0]; % Differenz
S       = [Sstar(end)/Sstar_0]; % dimensionslose Differenz

% Zeitschritt dt^*
dtstar = .1;
dt     = k_T*dtstar; % dimensionslos

% Begin der Simulation
tstar = [0];
t     = [0];
amount_of_iterations = 10;
for i = [1:amount_of_iterations/dtstar]
    % Original Gleichungen
    qstar = a*(b*(Tstar_1(end) - Tstar_2(end)) + c*(Sstar_2(end) - Sstar_1(end)));
    
    dTstar_1 = ( k_T*(Tstar_01 - Tstar_1(end)) + abs(qstar)*(Tstar_2(end) - Tstar_1(end)) )*dtstar;
    dTstar_2 = ( k_T*(Tstar_02 - Tstar_2(end)) + abs(qstar)*(Tstar_1(end) - Tstar_2(end)) )*dtstar;
    
    dSstar_1 = ( k_T*(Sstar_01 - Sstar_1(end)) + abs(qstar)*(Sstar_2(end) - Sstar_1(end)) )*dtstar;
    dSstar_2 = ( k_T*(Sstar_02 - Sstar_2(end)) + abs(qstar)*(Sstar_1(end) - Sstar_2(end)) )*dtstar;
    
    tstar(end+1) = tstar(end) + dtstar;
    
    Tstar_1(end+1) = Tstar_1(end) + dTstar_1;
    Tstar_2(end+1) = Tstar_2(end) + dTstar_2;
    
    Sstar_1(end+1) = Sstar_1(end) + dSstar_1;
    Sstar_2(end+1) = Sstar_2(end) + dSstar_2;
    
    % Gleichungen für die Differenz
    dTstar = ( k_T*(Tstar_0 - Tstar(end)) - 2*abs(qstar)*Tstar(end) )*dtstar;
    dSstar = ( k_S*(Sstar_0 - Sstar(end)) - 2*abs(qstar)*Sstar(end) )*dtstar;
   
    Tstar(end+1) = Tstar(end) + dTstar;
    Sstar(end+1) = Sstar(end) + dSstar;
    
    % dimensionslose Rechnung
    q  = alpha*T(end) - beta*T(end);
    dT = (       (1 - T(end)) - abs(q)*T(end) )*dt;
    dS = ( gamma*(1 - S(end)) - abs(q)*S(end) )*dt;
    
    t(end+1) = t(end) + dt;
    T(end+1) = T(end) + dT;
    S(end+1) = S(end) + dT;
end

row_count = 3;

subplot(row_count,2,1);
plot(tstar, Tstar_1, tstar, Tstar_2);
title('Temperatur');

subplot(row_count,2,2);
plot(tstar, Sstar_1, tstar, Sstar_2);
title('Salzgehalt');

subplot(row_count,2,3);
plot(tstar, Tstar, 'k', tstar, Tstar_1-Tstar_2, ':w');

subplot(row_count,2,4);
plot(tstar, Sstar, 'k', tstar, Sstar_1-Sstar_2, ':w');

subplot(row_count,2,5);
plot(t, T, 'k', k_T*tstar, Tstar./Tstar_0, ':w');

subplot(row_count,2,6);
plot(t, S, 'k', k_T*tstar, Sstar./Sstar_0, ':w');




