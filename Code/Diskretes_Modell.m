clear;
close all;

% Behälter 1: Golf von Mexiko
% Behälter 2: Nordmeer
% --> Wasser gefriert zu Eis, Salz wird ausgelöst, höherer Salzgehalt > höhere Dichte
% wenn aber Sstar_02 > Sstar_01, dann Sstar_01 - Sstar_02 < 0
% und damit beta < 0 ...?
% sollten aber alpha und beta nicht jeweils > 0 sein?

% Anfangsbedingungen
Tstar_01 = 1;    % wärmer
Tstar_02 = 0.5; % kälter

%Tstar_01 = 20;    % wärmer
%Tstar_02 = 10;    % kälter

Tstar_0  = Tstar_01 - Tstar_02; 


Sstar_01 = 0.5;
Sstar_02 = 1;

%Sstar_01 = 28;
%Sstar_02 = 30;

Sstar_0  = Sstar_01 - Sstar_02; % Sstar_1 < Sstar_2 => Sstar < 0 => beta < 0

% Austauschraten
k_T = 1;
k_S = 0.1; % damit gamma = 0.1 = k_S/k_T

%k_T = 0.5;
%k_S = 0.2;

% weitere Proportionalitätskonstanten
a = 1; % > 0
b = 1; % > 0
c = 1; % > 0

%a = 1;
%b = 1;
%c = 0.5;

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
dtstar = 0.01;
dt     = k_T*dtstar; % dimensionslos

% Begin der Simulation
tstar = [0];
t     = [0];
amount_of_iterations = 10;

% Fluss zum Zeitpunkt t
Qstar = [];
Q =     [];

for i = [1:amount_of_iterations/dtstar]
    % Original Gleichungen
    qstar = a*(b*(Tstar_1(end) - Tstar_2(end)) + c*(Sstar_2(end) - Sstar_1(end)));
    Qstar(end+1) = qstar;
    
    dTstar_1 = ( k_T*(Tstar_01 - Tstar_1(end)) + abs(qstar)*(Tstar_2(end) - Tstar_1(end)) )*dtstar;
    dTstar_2 = ( k_T*(Tstar_02 - Tstar_2(end)) + abs(qstar)*(Tstar_1(end) - Tstar_2(end)) )*dtstar;
    
    dSstar_1 = ( k_S*(Sstar_01 - Sstar_1(end)) + abs(qstar)*(Sstar_2(end) - Sstar_1(end)) )*dtstar;
    dSstar_2 = ( k_S*(Sstar_02 - Sstar_2(end)) + abs(qstar)*(Sstar_1(end) - Sstar_2(end)) )*dtstar;
    
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
    q  = alpha*T(end) - beta*S(end);
    Q(end+1) = q;
    
    dT = (       (1 - T(end)) - abs(q)*T(end) )*dt;
    dS = ( gamma*(1 - S(end)) - abs(q)*S(end) )*dt;
    
    t(end+1) = t(end) + dt;
    T(end+1) = T(end) + dT;
    S(end+1) = S(end) + dS;
end

row_count = 3;
cols_count = 3;

subplot(row_count,cols_count,1);
plot(tstar, Tstar_1, tstar, Tstar_2);
title('Temperatur');
legend('T^*_1','T^*_2');

subplot(row_count,cols_count,4);
plot(tstar, Tstar, 'k', tstar, Tstar_1-Tstar_2, ':r');
legend('T^*','T^*_1-T^*_2');

subplot(row_count,cols_count,7);
plot(t, T, 'k', k_T*tstar, Tstar./Tstar_0, ':r');
legend('T','T^*/T^*_0');

subplot(row_count,cols_count,2);
plot(tstar, Sstar_1, tstar, Sstar_2);
title('Salzgehalt');
legend('S^*_1','S^*_2');

subplot(row_count,cols_count,5);
plot(tstar, Sstar, 'k', tstar, Sstar_1-Sstar_2, ':r');
legend('S^*','S^*_1-S^*_2');

subplot(row_count,cols_count,8);
plot(t, S, 'k', k_T*tstar, Sstar./Sstar_0, ':r');
legend('S','S^*/S^*_0');

% Fluss
t = t(1:end-1);
subplot(row_count,cols_count,3);
plot(t,Qstar,t,Q);

% Gleichgewichtsuntersuchung
g = @(q) alpha.*(1./(1+abs(q))) - beta.*(gamma./(gamma+abs(q)));
q = linspace(-2,2,1000);

subplot(row_count,cols_count,6);
plot(q,g(q),q,q,'k',[min(q),max(q)],[0,0],':k');
axis([min(q) max(q) min(g(q))*2 max(g(q))*2]);
title({['alpha=',num2str(alpha),', beta=',num2str(beta),', gamma=',num2str(gamma)],['g(0)=alpha-beta=',num2str(alpha-beta),' < 0']});
