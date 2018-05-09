clear;
close all;

% Behälter 1: Golf von Mexiko
% Behälter 2: Europäisches Nordmeer

% Temperatur der Umgebungen (Grad Celsius)
% Quelle: https://data.giss.nasa.gov/gistemp/
% Data for 1990:
% Southern Hemisphere: +0.74
% Northern Hemisphere: +0.44
% Absolute Value? https://agupubs.onlinelibrary.wiley.com/doi/full/10.1002/jgrd.50359
% "most widely quoted value for the global average for the 1961-1990 period
% is 14.0°C"
%T0_1 = 14+0.74;
%T0_2 = 14+0.44;
T0_1 = 11;
T0_2 = 10;
T0   = T0_1-T0_2;

%Salzgehalt der Umgebungen (Promille)
S0_1 = 10;
S0_2 = 11;
S0   = S0_1-S0_2;

% Temperatur der Behälter
T_1  = [T0_1]; % 1
T_2  = [T0_2]; % 2
T    = [T0];   % differenz
T_s  = [1];    % skaliert
T_sc = [1];    % skaliert (gerechnet)

% Salzgehalt der Behälter
S_1  = [S0_1]; % 1
S_2  = [S0_2]; % 2
S    = [S0];   % differenz
S_s  = [1];    % skaliert
S_sc = [1];    % skaliert (gerechnet)

% Fluss
Q = [0];

% Austauschraten
k_t = 1; % Temperatur
k_s = 1; % Salzgehalt

% Abhängigkeit Temperatur, Salzgehalt => Dichte
% 1,025 kg/l bei 25 °C (https://de.wikipedia.org/wiki/Salzwasser)
rho_0 = 1;

b = 1;
c = 1;

% nach Abbildung 13.2 gilt
% für S=33 und T=0 : rho=1027.5
% sei rho nun linear, so muss für rho=1027.5 : S=37, T=30 gelten
% dies führt zu den folgenden zwei Gleichungen:
% rho = rho_0 - b*T1 + c*S1             (1)
% rho = rho_0 - b*T2 + c*S2             (2)
% aus (1): c = 1/S1(rho - rho_0 + b*T1) (3)
% (3) in (2): rho = rho_0 - b*T2 + 1/S1(rho - rho_0 + b*T1)*S2
%             rho = rho_0 - b*T2 + S2/S1(rho - rho_0) + b*T1*S2/S1
%             rho = rho_0 - b(T2 - T1*S2/S1) + S2/S1(rho - rho_0)
%               b = 1/(T2 - T1*S2/S1)( rho_0 - rho - S2/S1(rho_0 - rho) )
%               b = 1/(T2 - T1*S2/S1)(rho_0 - rho)(1 - S2/S1)
rho_0 = 1000;
abbRho = 1027.5;
abbS1 = 33;
abbT1 = 0;
abbS2 = 37;
abbT2 = 30;

b = 1/(abbT2 - abbT1*abbS2/abbS1)*(rho_0 - abbRho)*(1 - abbS2/abbS1)
c = 1/abbS1*(abbRho - rho_0 + b*abbT1)

rho = @(T_i,S_i) rho_0 - b*T_i + c*S_i;

hold on;
rho_test_sequence = [1024:1030];
for rho_i = rho_test_sequence
    T_rho = @(S) 1/b*(rho_0 - rho_i + c*S);
    s = [33:37];
    plot(s,T_rho(s),'DisplayName',num2str(rho_i));
end
axis([33 37 0 30]);
legend('show');
xlabel('Salzgehalt');
ylabel('Temperatur');
hold off;
return;


% Proportionalitätskonstante a > 0
a = 1;

% Paramter für die skalierte Rechnung
alpha = 2*((a*b)/k_t)*T0;
beta = 2*((a*c)/k_t)*S0;
gamma = k_s/k_t;

% Begin der Simulation
dt = .1;
t = [0];
amount_of_iterations = 10;
for i = [1:amount_of_iterations/dt]
    
    % Fluss
    rho_1 = rho(T_1(end),S_1(end));
    rho_2 = rho(T_2(end),S_2(end));
    q = a*(rho_2 - rho_1);
    Q(end+1) = q*dt;
    
    % Temperatur
    dT1 = ( k_t*(T0_1 - T_1(end))+abs(q)*(T_2(end) - T_1(end)) )*dt;
    dT2 = ( k_t*(T0_2 - T_2(end))+abs(q)*(T_1(end) - T_2(end)) )*dt;
    
    T_1(end+1) = T_1(end) + dT1;
    T_2(end+1) = T_2(end) + dT2;
    
    % Salzgehalt
    dS1 = ( k_s*(S0_1 - S_1(end))+abs(q)*(S_2(end) - S_1(end)) )*dt;
    dS2 = ( k_s*(S0_2 - S_2(end))+abs(q)*(S_1(end) - S_2(end)) )*dt;
    
    S_1(end+1) = S_1(end) + dT1;
    S_2(end+1) = S_2(end) + dT2;
    
    T(end+1) = T_1(end) - T_2(end);
    S(end+1) = S_1(end) - S_2(end);
    
    T_s(end+1) = T(end)/T0;
    S_s(end+1) = S(end)/S0;
    
    t(end+1) = t(end) + 1; % increment the time
    
    % Skalierte Rechnung
    q_sc  = alpha*T_sc(end)-beta*S_sc;
    dT_sc = ( (1 - T_sc(end)) - abs(q)*T_sc(end) )*dt;
    dS_sc = ( gamma*(1 - S_sc(end)) - abs(q)*S_sc(end) )*dt;
    
    T_sc(end+1) = T_sc(end) + dT_sc;
    S_sc(end+1) = S_sc(end) + dS_sc;
    
end

%t = t(2:end); % don't plot t0

%T_1 = T_1(2:end); 
%T_2 = T_2(2:end);
subplot(4,3,1);
plot(t,T_1,t,T_2);
legend('Golf','Nordmeer');

%S_1 = S_1(2:end); 
%S_2 = S_2(2:end);
subplot(4,3,2);
plot(t,S_1,t,S_2);
legend('Golf','Nordmeer');

%Q = Q(2:end);
%subplot(4,3,3);
%plot(t,Q);
%legend('Fluss');

%T = T(2:end);
%subplot(4,3,4);
plot(t,T);
legend('deltaT');

%S = S(2:end);
%subplot(4,3,5);
plot(t,S);
legend('deltaS');

%T_s = T_s(2:end);
subplot(4,3,7);
plot(t,T_s);
legend('scaledT');

%S_s = S_s(2:end);
subplot(4,3,8);
plot(t,S_s);
legend('scaledS');

%T_sc = T_sc(2:end);
subplot(4,3,10);
plot(t,T_sc);
legend('scaledT calced');

%S_sc = S_sc(2:end);
subplot(4,3,11);
plot(t,S_sc);
legend('scaledS calced');