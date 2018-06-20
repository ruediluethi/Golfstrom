clear;
close all;

% Anfangsbedingungen
Tstar_01 = 2;
Tstar_02 = 0.8;

%Tstar_01 = 1.2;
%Tstar_02 = 0.8;
Tstar_0  = Tstar_01 - Tstar_02; 

Sstar_01 = 2;
Sstar_02 = 0.2;

%Sstar_01 = 0.8;
%Sstar_02 = 1.2;
Sstar_0  = Sstar_01 - Sstar_02;

% Austauschraten
k_T = 1;
k_S = 0.2;
%k_T = 1;
%k_S = 1;

% weitere Proportionalitätskonstanten
a = 1;
b = 1;
c = 1;

% dimensionslose Konstanten
alpha = 2*(a*b/k_T)*Tstar_0; 
beta  = 2*(a*c/k_T)*Sstar_0;
gamma = k_S/k_T;
disp(['alpha = ',num2str(alpha)]);
disp(['beta = ',num2str(beta)]);

for i = 1:10

    random_range = 3;
    
    % T^*_i(t): Temperatur zum Zeitpunkt t
    Tstar_1 = [Tstar_01+rand()*random_range-random_range/2];
    Tstar_2 = [Tstar_02+rand()*random_range-random_range/2];
    Tstar   = [Tstar_1(end) - Tstar_2(end)]; % Differenz
    T       = [Tstar(end)/Tstar_0]; % dimensionslose Differenz

    % S^*_i(t): Salzgehalt zum Zeitpunkt t
    Sstar_1 = [Sstar_01+rand()*random_range-random_range/2];
    Sstar_2 = [Sstar_02+rand()*random_range-random_range/2];
    Sstar   = [Sstar_1(end) - Sstar_2(end)]; % Differenz
    S       = [Sstar(end)/Sstar_0]; % dimensionslose Differenz

    % Zeitschritt dt^*
    dtstar = 0.02;
    dt     = k_T*dtstar; % dimensionslos
    %dt = dtstar;

    % Begin der Simulation
    tstar = [0];
    t     = [0];
    amount_of_iterations = 20;

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
    
    
    subplot(2,3,1);
    plot(t,T);
    hold on;
    plot(t,S);
    legend('T','S');
    
    
    subplot(2,3,2);
    %plot(tstar, Tstar_1 - Tstar_2);
    %plot(tstar, Tstar);
    
    %plot(tstar, Sstar_1 - Sstar_2);
    %plot(tstar, Sstar);
    
    t = t(1:end-1);
    plot(t, Q);
    hold on;
    legend('Q');
    
    
    subplot(2,3,3);
    
    
    %plot(Tstar_1 - Tstar_2, Sstar_1 - Sstar_2);
    
    plot(T, S);
    xlabel('T');
    ylabel('S');
    hold on;
    
end
    
resolution = 20;
borderScale = 0.3;

%[T,S] = meshgrid(linspace(min(Tstar)*(1-borderScale),max(Tstar)*(1+borderScale),resolution),linspace(min(Sstar)*(1-borderScale),max(Sstar)*(1+borderScale),resolution));
[T,S] = meshgrid(linspace(0,1,resolution),linspace(0,1,resolution));
axis([0 1 0 1]);
dT = @(T,S)       (1 - T) - abs(alpha.*T - beta.*S).*T;
dS = @(T,S) gamma.*(1 - S) - abs(alpha.*T - beta.*S).*S;
%dT = @(T,S) k_T.*(Tstar_0 - T) - 2.*abs(a.*(b.*T - c.*S)).*T;
%dS = @(T,S) k_S.*(Sstar_0 - S) - 2.*abs(a.*(b.*T - c.*S)).*S;
n = sqrt( dT(T,S).^2 + dS(T,S).^2 ); % norm

quiver(T,S,dT(T,S)./n,dS(T,S)./n,0.5);

J = [-1 - (alpha.*T - beta.*S)


    